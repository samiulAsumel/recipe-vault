import { timingSafeEqualStrings } from '@/lib/auth/timing-safe-equal';

/** Section 8: "PBKDF2 + HMAC session (admin only)" - a stateless, HMAC-signed token instead of
 * a server-side session store. No KV read needed just to check "is this request logged in";
 * the mustChangePassword *state*, though, is always re-read fresh from KV (lib/auth/admin-
 * credentials.ts) rather than baked into the token, so changing the password takes effect on
 * the very next request instead of only after a fresh login. */
export const SESSION_COOKIE_NAME = 'wka_admin_session';
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

interface SessionPayload {
  sub: 'admin';
  iat: number;
  exp: number;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Buffer.from(signature).toString('base64url');
}

export async function createSessionToken(secret: string): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = { sub: 'admin', iat: now, exp: now + SESSION_MAX_AGE_SECONDS * 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = await hmacSign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;

  const expectedSignature = await hmacSign(payloadB64, secret);
  if (!timingSafeEqualStrings(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as SessionPayload;
    return payload.sub === 'admin' && payload.exp > Date.now();
  } catch {
    return false;
  }
}
