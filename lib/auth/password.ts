import { timingSafeEqualBytes } from '@/lib/auth/timing-safe-equal';

/** OWASP's 2023 minimum for PBKDF2-HMAC-SHA256. PBKDF2 via Web Crypto, not bcrypt - bcrypt's
 * native bindings don't run in the Cloudflare Workers runtime, and Section 8 specifies PBKDF2
 * for exactly that reason. Works identically in `next dev` (Node 20+ has the same Web Crypto
 * API) and in the deployed Worker - no extra dependency either way. */
const PBKDF2_ITERATIONS = 210_000;
const HASH_ALGORITHM = 'SHA-256';
const SALT_BYTES = 16;
const KEY_LENGTH_BITS = 256;
const SCHEME = 'pbkdf2';

async function deriveHash(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: HASH_ALGORITHM, salt, iterations },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(derived);
}

/** Self-describing format (`pbkdf2$<iterations>$<salt>$<hash>`) so a future iteration-count
 * bump doesn't invalidate hashes stored under the old count. */
export async function hashPassword(password: string): Promise<string> {
  const salt: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveHash(password, salt, PBKDF2_ITERATIONS);
  return `${SCHEME}$${PBKDF2_ITERATIONS}$${Buffer.from(salt).toString('base64')}$${Buffer.from(hash).toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== SCHEME) return false;

  const [, iterationsRaw, saltB64, hashB64] = parts;
  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt: Uint8Array<ArrayBuffer> = new Uint8Array(Buffer.from(saltB64, 'base64'));
  const expected: Uint8Array<ArrayBuffer> = new Uint8Array(Buffer.from(hashB64, 'base64'));
  const actual = await deriveHash(password, salt, iterations);

  return timingSafeEqualBytes(actual, expected);
}
