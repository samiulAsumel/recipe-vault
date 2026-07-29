// PBKDF2 password hashing + HMAC session-token signing, both via WebCrypto
// (available in the Workers runtime, no npm crypto dependency needed).

// Cloudflare Workers' crypto.subtle hard-caps PBKDF2 at 100,000 iterations —
// deriveBits throws "iteration counts above 100000 are not supported" past that,
// so this is the maximum the platform allows, not a tuned security choice.
export const PBKDF2_ITERATIONS = 100_000;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

export interface PasswordHash {
  salt: string;
  hash: string;
  iterations: number;
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return { salt: toBase64Url(salt), hash: toBase64Url(derived), iterations: PBKDF2_ITERATIONS };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const derived = await pbkdf2(password, fromBase64Url(stored.salt), stored.iterations);
  return timingSafeEqual(derived, fromBase64Url(stored.hash));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

export async function hmacVerify(secret: string, payload: string, signature: string): Promise<boolean> {
  const key = await hmacKey(secret);
  try {
    return await crypto.subtle.verify("HMAC", key, fromBase64Url(signature), new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export { toBase64Url, fromBase64Url };
