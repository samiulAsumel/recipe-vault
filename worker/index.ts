// ============================================================================
//  world-kitchen-atlas-proxy  —  Cloudflare Worker
//  Read the PRIVATE GitHub repo samiulAsumel/world-kitchen-atlas-data from the
//  Next.js build (and later the browser) without ever exposing the GitHub
//  token client-side. Read-only this phase — the write path (admin panel,
//  Phase 7) will add PUT once it exists.
//
//  Secret to configure (`wrangler secret put GITHUB_TOKEN`):
//    GITHUB_TOKEN   fine-grained PAT with Contents: Read on world-kitchen-atlas-data
//
//  Endpoints:
//    GET  /                    -> { countries: CountrySummary[] }
//    GET  /dishes               -> DishEntry[]  (every country's entries, merged)
//    GET  /countries/{slug}      -> DishEntry[]  (+ X-Data-Sha header), 404 if unknown
// ============================================================================

interface Env {
  GITHUB_TOKEN: string;
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

interface GitHubFileContent {
  content: string;
  sha: string;
}

const REPO = "samiulAsumel/world-kitchen-atlas-data";
const DIR = "recipes";
const BRANCH = "main";
const SLUG_PATTERN = /^[a-z0-9-]+$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Expose-Headers": "X-Data-Sha",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, max-age=60", ...extra },
  });
}

function errorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// decode GitHub's base64 (may contain newlines) back to a UTF-8 string
function fromBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function gh(env: Env, path: string): Promise<Response> {
  return fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "world-kitchen-atlas-proxy",
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCountryFile(env: Env, filename: string): Promise<any[]> {
  const res = await gh(env, `contents/${DIR}/${filename}?ref=${BRANCH}`);
  if (!res.ok) {
    throw new Error(`failed to read ${filename}: ${res.status}`);
  }
  const meta = (await res.json()) as GitHubFileContent;
  return JSON.parse(fromBase64Utf8(meta.content));
}

// Lists recipes/*.json and fetches every file's content in parallel.
// Returns [] (not an error) when the directory doesn't exist yet — that is
// the expected state before Phase 8 seeds any data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllDishes(env: Env): Promise<any[]> {
  const listRes = await gh(env, `contents/${DIR}?ref=${BRANCH}`);
  if (listRes.status === 404) return [];
  if (!listRes.ok) {
    throw new Error(`failed to list ${DIR}: ${listRes.status}`);
  }

  const items = (await listRes.json()) as GitHubContentItem[];
  const files = items.filter((item) => item.type === "file" && item.name.endsWith(".json"));

  const perFile = await Promise.all(files.map((file) => fetchCountryFile(env, file.name)));
  return perFile.flat();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== "GET") {
      return errorResponse(405, "method_not_allowed", "Only GET is supported.");
    }

    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    try {
      // GET /
      if (segments.length === 0) {
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
      if (segments.length === 1 && segments[0] === "dishes") {
        return json(await fetchAllDishes(env));
      }

      // GET /countries/{slug}
      if (segments.length === 2 && segments[0] === "countries") {
        const slug = segments[1];
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

      return errorResponse(404, "not_found", `No route for ${url.pathname}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return errorResponse(502, "upstream_error", message);
    }
  },
};
