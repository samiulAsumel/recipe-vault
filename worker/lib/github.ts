import type { Dish, Env, GitHubContentItem, GitHubFileContent } from "../types";
import { REPO, DIR, BRANCH } from "../types";

export class GitHubConflictError extends Error {
  constructor(path: string) {
    super(`Conflicting write to ${path} — the file changed since it was last read.`);
    this.name = "GitHubConflictError";
  }
}

// decode GitHub's base64 (may contain newlines) back to a UTF-8 string
export function fromBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// encode a UTF-8 string to GitHub's expected base64 content
export function toBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin);
}

export function gh(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "world-kitchen-atlas-proxy",
      ...init.headers,
    },
  });
}

/**
 * Reads recipes/{filename}, returns its parsed dish array. Throws if the file is missing.
 * Uses the raw media type rather than the default JSON+base64 response: GitHub's Contents
 * API only inlines `content` for files under 1MB, and country files (e.g. bangladesh.json
 * with full Section 4-23 content for 50+ dishes) now exceed that. The raw media type
 * supports files up to 100MB.
 */
export async function fetchCountryFile(env: Env, filename: string): Promise<Dish[]> {
  const res = await gh(env, `contents/${DIR}/${filename}?ref=${BRANCH}`, {
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!res.ok) {
    throw new Error(`failed to read ${filename}: ${res.status}`);
  }
  return JSON.parse(await res.text()) as Dish[];
}

/**
 * Reads recipes/{slug}.json for the admin panel, returning the sha alongside the
 * dishes so a subsequent write can supply it as the optimistic-lock handle.
 * Returns sha: undefined (dishes: []) when the country file doesn't exist yet —
 * that's a valid state, the write path treats it as "create".
 */
export async function readCountryFile(
  env: Env,
  slug: string,
): Promise<{ dishes: Dish[]; sha: string | undefined }> {
  const res = await gh(env, `contents/${DIR}/${slug}.json?ref=${BRANCH}`);
  if (res.status === 404) {
    return { dishes: [], sha: undefined };
  }
  if (!res.ok) {
    throw new Error(`failed to read ${slug}.json: ${res.status}`);
  }
  const meta = (await res.json()) as GitHubFileContent;
  if (meta.content) {
    return { dishes: JSON.parse(fromBase64Utf8(meta.content)) as Dish[], sha: meta.sha };
  }
  // Over the 1MB inline-content limit — meta.sha is still present, fall back to
  // a raw fetch for the body (see fetchCountryFile).
  return { dishes: await fetchCountryFile(env, `${slug}.json`), sha: meta.sha };
}

/**
 * Writes recipes/{slug}.json via the GitHub Contents API. Pass the sha last read
 * for that file (undefined for a brand-new file); GitHub 409s/422s if it's stale,
 * which is surfaced as GitHubConflictError so the caller can ask the client to retry.
 */
export async function writeCountryFile(
  env: Env,
  slug: string,
  dishes: Dish[],
  message: string,
  sha: string | undefined,
): Promise<{ sha: string }> {
  const res = await gh(env, `contents/${DIR}/${slug}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: toBase64Utf8(JSON.stringify(dishes, null, 2) + "\n"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new GitHubConflictError(`${DIR}/${slug}.json`);
  }
  if (!res.ok) {
    throw new Error(`failed to write ${slug}.json: ${res.status}`);
  }
  const body = (await res.json()) as { content: GitHubFileContent };
  return { sha: body.content.sha };
}

/** Lists recipes/*.json filenames (without fetching content). [] if the dir doesn't exist. */
export async function listCountryFiles(env: Env): Promise<string[]> {
  const listRes = await gh(env, `contents/${DIR}?ref=${BRANCH}`);
  if (listRes.status === 404) return [];
  if (!listRes.ok) {
    throw new Error(`failed to list ${DIR}: ${listRes.status}`);
  }
  const items = (await listRes.json()) as GitHubContentItem[];
  return items.filter((item) => item.type === "file" && item.name.endsWith(".json")).map((item) => item.name);
}

// Lists recipes/*.json and fetches every file's content in parallel.
// Returns [] (not an error) when the directory doesn't exist yet — that is
// the expected state before any data has been seeded.
export async function fetchAllDishes(env: Env): Promise<Dish[]> {
  const files = await listCountryFiles(env);
  const perFile = await Promise.all(files.map((file) => fetchCountryFile(env, file)));
  return perFile.flat();
}
