const TOKEN_KEY = "wka_admin_token";
const EXPIRES_KEY = "wka_admin_token_expires_at";

export interface StoredSession {
  token: string;
  expiresAt: number;
}

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const token = window.sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = window.sessionStorage.getItem(EXPIRES_KEY);
  if (!token || !expiresAt) return null;
  return { token, expiresAt: Number(expiresAt) };
}

export function setStoredSession(token: string, expiresAt: number): void {
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.sessionStorage.setItem(EXPIRES_KEY, String(expiresAt));
}

export function clearStoredSession(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(EXPIRES_KEY);
}
