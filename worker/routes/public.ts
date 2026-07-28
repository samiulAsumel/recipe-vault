import type { Env, GitHubFileContent } from "../types";
import { SLUG_PATTERN, DIR, BRANCH } from "../types";
import { json, errorResponse } from "../lib/http";
import { gh, fromBase64Utf8, fetchAllDishes } from "../lib/github";
import { incrementKvCounter } from "../lib/analytics";

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

// GET /api/track?page=&id=  — fire-and-forget visit counter, never errors
// on malformed input: total + daily always increment, and a per-item counter
// (country/dish) only when page and id are recognized and id passes the same
// slug guard as /countries/{slug} (stops KV-key injection from arbitrary ids).
export async function handleTrack(env: Env, url: URL): Promise<Response> {
  const page = url.searchParams.get("page");
  const id = url.searchParams.get("id");
  const today = new Date().toISOString().slice(0, 10);

  const tasks = [
    incrementKvCounter(env.ANALYTICS, "visits:total"),
    incrementKvCounter(env.ANALYTICS, `visits:daily:${today}`),
  ];
  if ((page === "country" || page === "dish") && id && SLUG_PATTERN.test(id)) {
    tasks.push(incrementKvCounter(env.ANALYTICS, `visits:${page}:${id}`));
  }
  await Promise.all(tasks);

  return json({ ok: true });
}
