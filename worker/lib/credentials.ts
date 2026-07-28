import type { Env } from "../types";
import { hashPassword, verifyPassword } from "./crypto";

const CREDENTIALS_KEY = "admin:credentials";
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "123456";

export interface Credentials {
  username: string;
  salt: string;
  hash: string;
  iterations: number;
  mustChangePassword: boolean;
  passwordVersion: number;
  updatedAt: string;
}

/** Reads admin:credentials, seeding the default admin/123456 on first-ever call. */
export async function getCredentials(env: Env): Promise<Credentials> {
  const existing = await env.ANALYTICS.get<Credentials>(CREDENTIALS_KEY, "json");
  if (existing) return existing;

  const { salt, hash, iterations } = await hashPassword(DEFAULT_PASSWORD);
  const seeded: Credentials = {
    username: DEFAULT_USERNAME,
    salt,
    hash,
    iterations,
    mustChangePassword: true,
    passwordVersion: 1,
    updatedAt: new Date().toISOString(),
  };
  await env.ANALYTICS.put(CREDENTIALS_KEY, JSON.stringify(seeded));
  return seeded;
}

export async function verifyCredentials(
  env: Env,
  username: string,
  password: string,
): Promise<Credentials | null> {
  const creds = await getCredentials(env);
  if (username !== creds.username) return null;
  const ok = await verifyPassword(password, creds);
  return ok ? creds : null;
}

export async function setPassword(env: Env, newPassword: string): Promise<Credentials> {
  const current = await getCredentials(env);
  const { salt, hash, iterations } = await hashPassword(newPassword);
  const updated: Credentials = {
    ...current,
    salt,
    hash,
    iterations,
    mustChangePassword: false,
    passwordVersion: current.passwordVersion + 1,
    updatedAt: new Date().toISOString(),
  };
  await env.ANALYTICS.put(CREDENTIALS_KEY, JSON.stringify(updated));
  return updated;
}

const LOGIN_FAIL_LIMIT = 8;
const LOGIN_FAIL_TTL_SECONDS = 900;

function loginFailKey(ip: string): string {
  return `admin:loginfail:${ip}`;
}

export async function isLoginThrottled(env: Env, ip: string): Promise<boolean> {
  const count = await env.ANALYTICS.get(loginFailKey(ip));
  return count !== null && Number(count) >= LOGIN_FAIL_LIMIT;
}

export async function recordLoginFailure(env: Env, ip: string): Promise<void> {
  const key = loginFailKey(ip);
  const current = Number((await env.ANALYTICS.get(key)) ?? "0");
  await env.ANALYTICS.put(key, String(current + 1), { expirationTtl: LOGIN_FAIL_TTL_SECONDS });
}

export async function clearLoginFailures(env: Env, ip: string): Promise<void> {
  await env.ANALYTICS.delete(loginFailKey(ip));
}
