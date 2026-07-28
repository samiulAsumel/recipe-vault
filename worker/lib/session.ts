import type { Env } from "../types";
import { hmacSign, hmacVerify, toBase64Url, fromBase64Url } from "./crypto";

const SESSION_TTL_SECONDS = 30 * 60;
const RENEW_THRESHOLD_SECONDS = 10 * 60;

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
  pwv: number;
}

export interface Session {
  username: string;
  passwordVersion: number;
  expiresAt: number;
  shouldRenew: boolean;
}

function encodePayload(payload: TokenPayload): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function decodePayload(encoded: string): TokenPayload {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as TokenPayload;
}

export async function issueToken(env: Env, username: string, passwordVersion: number): Promise<{ token: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { sub: username, iat: now, exp: now + SESSION_TTL_SECONDS, pwv: passwordVersion };
  const encoded = encodePayload(payload);
  const signature = await hmacSign(env.SESSION_SECRET, encoded);
  return { token: `${encoded}.${signature}`, expiresAt: payload.exp };
}

/**
 * Verifies a Bearer token's signature, expiry, and that its embedded
 * passwordVersion still matches KV — a password change invalidates every
 * previously issued token at once, which is the only "logout everywhere" hook.
 */
export async function verifyToken(env: Env, token: string, currentPasswordVersion: number): Promise<Session | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;

  const validSignature = await hmacVerify(env.SESSION_SECRET, encoded, signature);
  if (!validSignature) return null;

  let payload: TokenPayload;
  try {
    payload = decodePayload(encoded);
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  if (payload.pwv !== currentPasswordVersion) return null;

  return {
    username: payload.sub,
    passwordVersion: payload.pwv,
    expiresAt: payload.exp,
    shouldRenew: payload.exp - now < RENEW_THRESHOLD_SECONDS,
  };
}

export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}
