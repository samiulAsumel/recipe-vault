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
