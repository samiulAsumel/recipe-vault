const CREDENTIALS_KEY = 'admin:credentials';

/** Section 11: "First-time setup: default credential admin/123456." Only ever compared
 * directly when no `admin:credentials` record exists yet in KV - once a real login succeeds,
 * this literal value is never consulted again. */
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = '123456';

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
  updatedAt: string;
}

export async function getAdminCredentials(env: CloudflareEnv): Promise<AdminCredentials | null> {
  const raw = await env.ANALYTICS_KV.get(CREDENTIALS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return null;
  }
}

export async function saveAdminCredentials(env: CloudflareEnv, credentials: AdminCredentials): Promise<void> {
  await env.ANALYTICS_KV.put(CREDENTIALS_KEY, JSON.stringify(credentials));
}
