import type { KVNamespace } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    GITHUB_OWNER: string;
    GITHUB_REPO: string;
    GITHUB_TOKEN: string;
    GITHUB_RECIPES_PATH?: string;
    /** Section 10 visit counters (visits:total, visits:daily:*, visits:country:*, visits:dish:*),
     * also reused (Section 11) for the single `admin:credentials` key - one KV store, namespaced
     * by key prefix, same pattern the visit counters already use. */
    ANALYTICS_KV: KVNamespace;
    /** Signs/verifies the admin HMAC session token (Section 8). Set via `wrangler secret put
     * SESSION_SECRET` in production; a long random string, never a guessable value. */
    SESSION_SECRET: string;
  }
}

export {};
