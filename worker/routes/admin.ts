import type { Dish, Env } from "../types";
import { SLUG_PATTERN } from "../types";
import { json, errorResponse } from "../lib/http";
import { readCountryFile, writeCountryFile, listCountryFiles, fetchAllDishes, GitHubConflictError } from "../lib/github";
import {
  verifyCredentials,
  setPassword,
  getCredentials,
  isLoginThrottled,
  recordLoginFailure,
  clearLoginFailures,
} from "../lib/credentials";
import { issueToken, verifyToken, extractBearerToken, type Session } from "../lib/session";
import { validateDish } from "../lib/validateDish";
import { getVisitCounter } from "../lib/analytics";

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

// json()'s default Cache-Control (public, max-age=60) is correct for the public
// read routes in routes/public.ts but wrong here: session tokens, analytics, and
// recipe data all change per-request, and a browser genuinely serving a cached
// admin response (proven while testing the Analytics tab — stale KV data was
// served from HTTP cache instead of hitting the network) is a real bug, not a
// hypothetical one. Every admin response overrides it to no-store.
function adminJson(body: unknown, status = 200): Response {
  return json(body, status, { "Cache-Control": "no-store" });
}

interface AuthResult {
  session: Session;
  mustChangePassword: boolean;
  renewedToken: string | null;
}

/** Validates the Bearer token. Does NOT enforce the forced-password-change gate. */
async function authenticate(env: Env, request: Request): Promise<AuthResult | Response> {
  const token = extractBearerToken(request);
  if (!token) return errorResponse(401, "unauthorized", "Missing bearer token.");

  const creds = await getCredentials(env);
  const session = await verifyToken(env, token, creds.passwordVersion);
  if (!session) return errorResponse(401, "unauthorized", "Invalid or expired session.");

  let renewedToken: string | null = null;
  if (session.shouldRenew) {
    renewedToken = (await issueToken(env, creds.username, creds.passwordVersion)).token;
  }
  return { session, mustChangePassword: creds.mustChangePassword, renewedToken };
}

function withSessionHeader(res: Response, renewedToken: string | null): Response {
  if (!renewedToken) return res;
  const headers = new Headers(res.headers);
  headers.set("X-Session-Token", renewedToken);
  return new Response(res.body, { status: res.status, headers });
}

/** Full auth: valid token AND password already changed from the default. */
async function requireFullAuth(env: Env, request: Request): Promise<AuthResult | Response> {
  const result = await authenticate(env, request);
  if (result instanceof Response) return result;
  if (result.mustChangePassword) {
    return errorResponse(403, "password_change_required", "Default password must be changed before continuing.");
  }
  return result;
}

export async function handleLogin(env: Env, request: Request): Promise<Response> {
  const ip = clientIp(request);
  if (await isLoginThrottled(env, ip)) {
    return errorResponse(429, "too_many_attempts", "Too many failed logins. Try again later.");
  }

  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  if (!body?.username || !body?.password) {
    return errorResponse(400, "invalid_request", "username and password are required.");
  }

  const creds = await verifyCredentials(env, body.username, body.password);
  if (!creds) {
    await recordLoginFailure(env, ip);
    return errorResponse(401, "invalid_credentials", "Invalid username or password.");
  }

  await clearLoginFailures(env, ip);
  const { token, expiresAt } = await issueToken(env, creds.username, creds.passwordVersion);
  return adminJson({ token, expiresAt, mustChangePassword: creds.mustChangePassword });
}

export async function handleSession(env: Env, request: Request): Promise<Response> {
  const result = await authenticate(env, request);
  if (result instanceof Response) return result;
  return withSessionHeader(
    adminJson({
      username: result.session.username,
      expiresAt: result.session.expiresAt,
      mustChangePassword: result.mustChangePassword,
    }),
    result.renewedToken,
  );
}

export async function handlePasswordChange(env: Env, request: Request): Promise<Response> {
  const result = await authenticate(env, request);
  if (result instanceof Response) return result;

  const body = (await request.json().catch(() => null)) as
    | { currentPassword?: string; newPassword?: string }
    | null;
  if (!body?.currentPassword || !body?.newPassword) {
    return errorResponse(400, "invalid_request", "currentPassword and newPassword are required.");
  }
  if (body.newPassword.length < 12) {
    return errorResponse(400, "weak_password", "New password must be at least 12 characters.");
  }
  if (body.newPassword === body.currentPassword) {
    return errorResponse(400, "weak_password", "New password must differ from the current password.");
  }

  const creds = await verifyCredentials(env, result.session.username, body.currentPassword);
  if (!creds) {
    return errorResponse(401, "invalid_credentials", "Current password is incorrect.");
  }

  const updated = await setPassword(env, body.newPassword);
  const { token, expiresAt } = await issueToken(env, updated.username, updated.passwordVersion);
  return adminJson({ token, expiresAt });
}

export async function handleAdminCountries(env: Env, request: Request): Promise<Response> {
  const result = await requireFullAuth(env, request);
  if (result instanceof Response) return result;

  const dishes = await fetchAllDishes(env);
  const bySlug = new Map<string, { slug: string; name: string; continentSlug: string; dishCount: number }>();
  for (const dish of dishes) {
    const existing = bySlug.get(dish.countrySlug);
    if (existing) existing.dishCount += 1;
    else {
      bySlug.set(dish.countrySlug, {
        slug: dish.countrySlug,
        name: dish.country,
        continentSlug: dish.continentSlug,
        dishCount: 1,
      });
    }
  }
  const files = await listCountryFiles(env);
  return withSessionHeader(adminJson({ countries: [...bySlug.values()], countryFiles: files }), result.renewedToken);
}

export async function handleAnalytics(env: Env, request: Request): Promise<Response> {
  const result = await requireFullAuth(env, request);
  if (result instanceof Response) return result;

  const summary = await getVisitCounter(env).summary();
  return withSessionHeader(adminJson(summary), result.renewedToken);
}

export async function handleAdminCountryDetail(env: Env, request: Request, slug: string): Promise<Response> {
  const result = await requireFullAuth(env, request);
  if (result instanceof Response) return result;
  if (!SLUG_PATTERN.test(slug)) return errorResponse(400, "invalid_slug", "Country slug must match ^[a-z0-9-]+$.");

  const { dishes, sha } = await readCountryFile(env, slug);
  return withSessionHeader(adminJson({ dishes, sha: sha ?? null }), result.renewedToken);
}

interface DishWritePayload {
  dish?: unknown;
  expectedSha?: string;
}

async function readDishPayload(request: Request): Promise<DishWritePayload | null> {
  return (await request.json().catch(() => null)) as DishWritePayload | null;
}

function conflictOrThrow(err: unknown): Response {
  if (err instanceof GitHubConflictError) {
    return errorResponse(409, "stale_data", "The country file changed since it was last read. Refetch and retry.");
  }
  throw err;
}

export async function handleCreateDish(env: Env, request: Request, countrySlug: string): Promise<Response> {
  const result = await requireFullAuth(env, request);
  if (result instanceof Response) return result;
  if (!SLUG_PATTERN.test(countrySlug)) {
    return errorResponse(400, "invalid_slug", "Country slug must match ^[a-z0-9-]+$.");
  }

  const payload = await readDishPayload(request);
  if (!payload?.dish) return errorResponse(400, "invalid_request", "A dish payload is required.");

  const issues = validateDish(payload.dish);
  if (issues.length > 0) {
    return adminJson({ error: "validation_error", message: "Dish payload failed validation.", details: issues }, 400);
  }

  const dish = payload.dish as Dish;
  if (dish.countrySlug !== countrySlug) {
    return errorResponse(400, "mismatched_country", "dish.countrySlug must match the URL's country slug.");
  }

  try {
    const { dishes, sha } = await readCountryFile(env, countrySlug);
    if (payload.expectedSha !== undefined && (sha ?? null) !== payload.expectedSha) {
      return errorResponse(409, "stale_data", "The country file changed since it was last read. Refetch and retry.");
    }
    if (dishes.some((d) => d.slug === dish.slug)) {
      return errorResponse(409, "duplicate_dish", `A dish with slug "${dish.slug}" already exists in ${countrySlug}.`);
    }
    const updated = [...dishes, dish];
    const { sha: newSha } = await writeCountryFile(
      env,
      countrySlug,
      updated,
      `feat(data): add ${dish.name} to ${dish.country}`,
      sha,
    );
    return withSessionHeader(adminJson({ dish, sha: newSha }, 201), result.renewedToken);
  } catch (err) {
    return conflictOrThrow(err);
  }
}

export async function handleUpdateDish(
  env: Env,
  request: Request,
  countrySlug: string,
  dishSlug: string,
): Promise<Response> {
  const result = await requireFullAuth(env, request);
  if (result instanceof Response) return result;
  if (!SLUG_PATTERN.test(countrySlug)) {
    return errorResponse(400, "invalid_slug", "Country slug must match ^[a-z0-9-]+$.");
  }

  const payload = await readDishPayload(request);
  if (!payload?.dish) return errorResponse(400, "invalid_request", "A dish payload is required.");

  const issues = validateDish(payload.dish);
  if (issues.length > 0) {
    return adminJson({ error: "validation_error", message: "Dish payload failed validation.", details: issues }, 400);
  }

  const dish = payload.dish as Dish;
  if (dish.countrySlug !== countrySlug) {
    return errorResponse(400, "mismatched_country", "dish.countrySlug must match the URL's country slug.");
  }

  try {
    const { dishes, sha } = await readCountryFile(env, countrySlug);
    if (payload.expectedSha !== undefined && (sha ?? null) !== payload.expectedSha) {
      return errorResponse(409, "stale_data", "The country file changed since it was last read. Refetch and retry.");
    }
    const index = dishes.findIndex((d) => d.slug === dishSlug);
    if (index === -1) return errorResponse(404, "not_found", `No dish "${dishSlug}" in ${countrySlug}.`);
    if (dish.slug !== dishSlug && dishes.some((d, i) => i !== index && d.slug === dish.slug)) {
      return errorResponse(409, "duplicate_dish", `A dish with slug "${dish.slug}" already exists in ${countrySlug}.`);
    }
    const updated = [...dishes];
    updated[index] = dish;
    const { sha: newSha } = await writeCountryFile(
      env,
      countrySlug,
      updated,
      `chore(data): update ${dish.name} in ${dish.country}`,
      sha,
    );
    return withSessionHeader(adminJson({ dish, sha: newSha }), result.renewedToken);
  } catch (err) {
    return conflictOrThrow(err);
  }
}

export async function handleDeleteDish(
  env: Env,
  request: Request,
  countrySlug: string,
  dishSlug: string,
): Promise<Response> {
  const result = await requireFullAuth(env, request);
  if (result instanceof Response) return result;
  if (!SLUG_PATTERN.test(countrySlug)) {
    return errorResponse(400, "invalid_slug", "Country slug must match ^[a-z0-9-]+$.");
  }

  const payload = (await request.json().catch(() => ({}))) as { expectedSha?: string };

  try {
    const { dishes, sha } = await readCountryFile(env, countrySlug);
    if (payload.expectedSha !== undefined && (sha ?? null) !== payload.expectedSha) {
      return errorResponse(409, "stale_data", "The country file changed since it was last read. Refetch and retry.");
    }
    const index = dishes.findIndex((d) => d.slug === dishSlug);
    if (index === -1) return errorResponse(404, "not_found", `No dish "${dishSlug}" in ${countrySlug}.`);
    const removed = dishes[index];
    const updated = dishes.filter((_, i) => i !== index);
    const { sha: newSha } = await writeCountryFile(
      env,
      countrySlug,
      updated,
      `chore(data): remove ${removed.name} from ${removed.country}`,
      sha,
    );
    return withSessionHeader(adminJson({ sha: newSha }), result.renewedToken);
  } catch (err) {
    return conflictOrThrow(err);
  }
}
