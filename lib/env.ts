export class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `Missing required environment variable: ${name}. Set it in .env.local (see .env.example).`,
    );
    this.name = "MissingEnvError";
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new MissingEnvError(name);
  }
  return value;
}

/**
 * Base URL of the deployed world-kitchen-atlas-proxy Worker, e.g.
 * https://world-kitchen-atlas-proxy.<subdomain>.workers.dev
 *
 * Deliberately not NEXT_PUBLIC_-prefixed: this is read at build time only
 * (generateStaticParams / server components), never inlined into client JS.
 */
export function getDataApiUrl(): string {
  return requireEnv("DATA_API_URL").replace(/\/+$/, "");
}

/**
 * Same Worker URL as getDataApiUrl(), but for the browser: the /admin panel is a
 * client component (static export has no server runtime) and must reach the
 * Worker's /admin/* endpoints directly, so this is NEXT_PUBLIC_-prefixed and
 * inlined into client JS at build time.
 *
 * Deliberately reads `process.env.NEXT_PUBLIC_DATA_API_URL` as a static literal
 * rather than going through requireEnv(name)'s `process.env[name]` — Next.js's
 * build-time inlining of NEXT_PUBLIC_ vars only recognizes the literal dot-access
 * form; a dynamic bracket lookup is never replaced, so in the browser bundle it
 * would silently resolve to undefined regardless of what's actually configured.
 * getDataApiUrl() above is unaffected since it only ever runs server-side at
 * build time, where the real process.env exists and dynamic lookup works fine.
 */
export function getPublicDataApiUrl(): string {
  const value = process.env.NEXT_PUBLIC_DATA_API_URL;
  if (!value) {
    throw new MissingEnvError("NEXT_PUBLIC_DATA_API_URL");
  }
  return value.replace(/\/+$/, "");
}

/**
 * Production domain, e.g. https://worldkitchenatlas.com — used to build absolute
 * canonical/OG URLs. Optional and undefined until a domain is chosen; pages fall
 * back to relative URLs (still valid metadata) rather than failing the build.
 */
export function getSiteUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  return value ? value.replace(/\/+$/, "") : undefined;
}
