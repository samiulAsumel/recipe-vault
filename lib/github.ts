import type { Recipe } from '@/types/recipe';

const GITHUB_API_BASE = 'https://api.github.com';

export class GithubDataError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'GithubDataError';
  }
}

/** Thrown when GITHUB_OWNER/GITHUB_REPO/GITHUB_TOKEN aren't set - distinct from GithubDataError
 * (GitHub reachable but returned an error) so callers can show "not configured yet" instead of
 * "GitHub is down". */
export class GithubConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GithubConfigError';
  }
}

const REQUIRED_ENV_KEYS = ['GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_TOKEN'] as const;

function assertGithubEnv(env: CloudflareEnv): void {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new GithubConfigError(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

interface GithubContentEntry {
  type: 'file' | 'dir';
  name: string;
  content?: string;
  encoding?: string;
  sha?: string;
}

function recipesPath(env: CloudflareEnv): string {
  return env.GITHUB_RECIPES_PATH ?? 'recipes';
}

function githubHeaders(env: CloudflareEnv): HeadersInit {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'world-kitchen-atlas-worker',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** Fetches a path from the private data repo's Contents API, cached at the Cloudflare edge. */
async function githubGetContents(path: string, env: CloudflareEnv): Promise<unknown> {
  const url = `${GITHUB_API_BASE}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  const init: RequestInit & { cf?: { cacheTtl: number; cacheEverything: boolean } } = {
    headers: githubHeaders(env),
    cf: { cacheTtl: 60, cacheEverything: true },
  };

  const response = await fetch(url, init);

  if (response.status === 404) {
    throw new GithubDataError(`Not found in GitHub repo: ${path}`, 404);
  }
  if (!response.ok) {
    throw new GithubDataError(`GitHub API error ${response.status} fetching ${path}`, 502);
  }

  return response.json();
}

/** Lists country slugs by reading the `recipes/` directory (Section 4: one file per country). */
export async function listCountrySlugs(env: CloudflareEnv): Promise<string[]> {
  assertGithubEnv(env);
  const path = recipesPath(env);
  const entries = await githubGetContents(path, env);

  if (!Array.isArray(entries)) {
    throw new GithubDataError(`Expected "${path}" to be a directory in the GitHub repo`, 502);
  }

  return (entries as GithubContentEntry[])
    .filter((entry) => entry.type === 'file' && entry.name.endsWith('.json'))
    .map((entry) => entry.name.replace(/\.json$/, ''));
}

export async function fetchCountryRecipes(countrySlug: string, env: CloudflareEnv): Promise<Recipe[]> {
  assertGithubEnv(env);
  const file = (await githubGetContents(`${recipesPath(env)}/${countrySlug}.json`, env)) as GithubContentEntry;

  if (file.type !== 'file' || file.encoding !== 'base64' || file.content === undefined) {
    throw new GithubDataError(`Unexpected content shape for ${countrySlug}.json`, 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(atob(file.content.replace(/\n/g, '')));
  } catch {
    throw new GithubDataError(`${countrySlug}.json is not valid JSON`, 502);
  }

  if (!Array.isArray(parsed)) {
    throw new GithubDataError(`${countrySlug}.json must contain an array of recipes`, 502);
  }

  return parsed as Recipe[];
}

export async function fetchAllRecipes(env: CloudflareEnv): Promise<Recipe[]> {
  const slugs = await listCountrySlugs(env);
  const perCountry = await Promise.all(slugs.map((slug) => fetchCountryRecipes(slug, env)));
  return perCountry.flat();
}

/** Section 12/13: writes the full recipe array back to `recipes/{countrySlug}.json` via the
 * Contents API's create-or-update PUT. Fetches the current file's sha first (required by
 * GitHub to update an existing file, omitted entirely when creating a brand-new one) - this
 * is a straight overwrite of the whole array, not a merge, so callers must pass the complete
 * updated list (see lib/admin-recipes.ts for the find-and-replace-or-append logic). */
export async function writeCountryRecipes(
  countrySlug: string,
  recipes: Recipe[],
  env: CloudflareEnv,
  commitMessage: string,
): Promise<void> {
  assertGithubEnv(env);
  const path = `${recipesPath(env)}/${countrySlug}.json`;

  let sha: string | undefined;
  try {
    const existing = (await githubGetContents(path, env)) as GithubContentEntry;
    sha = existing.sha;
  } catch (error) {
    if (!(error instanceof GithubDataError && error.statusCode === 404)) throw error;
  }

  const url = `${GITHUB_API_BASE}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  const body = {
    message: commitMessage,
    content: Buffer.from(JSON.stringify(recipes, null, 2)).toString('base64'),
    ...(sha ? { sha } : {}),
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...githubHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new GithubDataError(`GitHub API error ${response.status} writing ${path}`, 502);
  }
}
