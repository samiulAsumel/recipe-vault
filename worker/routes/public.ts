import type { Env, GitHubFileContent } from "../types";
import { SLUG_PATTERN, DIR, BRANCH } from "../types";
import { json, errorResponse } from "../lib/http";
import { gh, fromBase64Utf8, fetchAllDishes } from "../lib/github";
import { getVisitCounter, type PageKind } from "../lib/analytics";
import { hmacSign } from "../lib/crypto";

// GET /
export async function handleRoot(env: Env): Promise<Response> {
  const dishes = await fetchAllDishes(env);
  const bySlug = new Map<
    string,
    { slug: string; name: string; continentSlug: string; dishCount: number }
  >();
  for (const dish of dishes) {
    const existing = bySlug.get(dish.countrySlug);
    if (existing) {
      existing.dishCount += 1;
    } else {
      bySlug.set(dish.countrySlug, {
        slug: dish.countrySlug,
        name: dish.country,
        continentSlug: dish.continentSlug,
        dishCount: 1,
      });
    }
  }
  return json({ countries: [...bySlug.values()] });
}

// GET /dishes
export async function handleDishes(env: Env): Promise<Response> {
  return json(await fetchAllDishes(env));
}

// GET /countries/{slug}
export async function handleCountryBySlug(env: Env, slug: string): Promise<Response> {
  if (!SLUG_PATTERN.test(slug)) {
    return errorResponse(400, "invalid_slug", "Country slug must match ^[a-z0-9-]+$.");
  }

  const res = await gh(env, `contents/${DIR}/${slug}.json?ref=${BRANCH}`);
  if (res.status === 404) {
    return errorResponse(404, "not_found", `No recipe data for country "${slug}".`);
  }
  if (!res.ok) {
    return errorResponse(502, "github_error", `GitHub API returned ${res.status}.`);
  }
  const meta = (await res.json()) as GitHubFileContent;
  return json(JSON.parse(fromBase64Utf8(meta.content)), 200, {
    "X-Data-Sha": meta.sha,
  });
}

const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|python-requests|facebookexternalhit/i;

const TRACKABLE_PAGES = new Set<PageKind>(["home", "continent", "country", "dish", "other"]);

function normalizePage(value: string | null): PageKind {
  return value && TRACKABLE_PAGES.has(value as PageKind) ? (value as PageKind) : "other";
}

// GET /api/track?page=&id=  — fire-and-forget visit counter, never errors on
// malformed input: unrecognized `page` values still count toward the
// site-wide/daily totals rather than erroring. `id` only becomes a per-item
// counter when `page` is "country"/"dish" and `id` passes the same slug
// guard as /countries/{slug} (stops key injection from arbitrary ids). Bots
// and requests with no User-Agent are skipped so they never inflate visitor
// counts, but still get { ok: true } — a blocked beacon must never surface
// as a client-side error.
export async function handleTrack(env: Env, request: Request, url: URL): Promise<Response> {
  const trackJson = json({ ok: true }, 200, { "Cache-Control": "no-store" });

  const userAgent = request.headers.get("User-Agent") ?? "";
  if (!userAgent || BOT_USER_AGENT.test(userAgent)) {
    return trackJson;
  }

  const page = normalizePage(url.searchParams.get("page"));
  const id = url.searchParams.get("id");
  const slug = (page === "country" || page === "dish") && id && SLUG_PATTERN.test(id) ? id : undefined;

  const today = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  // Rotates daily (the date is part of the payload) and never stores the raw
  // IP — only a one-way HMAC of it, keyed by a secret never exposed client-side.
  const fingerprint = await hmacSign(env.SESSION_SECRET, `${ip}:${userAgent}:${today}`);

  const referrerHeader = request.headers.get("Referer");
  let referrerHost: string | undefined;
  if (referrerHeader) {
    try {
      const referrerUrl = new URL(referrerHeader);
      if (referrerUrl.hostname !== url.hostname) referrerHost = referrerUrl.hostname;
    } catch {
      // Malformed Referer header — not a trackable referrer, ignore it.
    }
  }

  const cfCountry = request.cf?.country;

  await getVisitCounter(env).record({
    date: today,
    fingerprint,
    page,
    slug,
    country: typeof cfCountry === "string" ? cfCountry : undefined,
    referrerHost,
  });

  return trackJson;
}
