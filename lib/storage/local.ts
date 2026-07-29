const PREFIX = "wka:v1:";

/** Reads a JSON value from localStorage, falling back safely across SSR, private mode, and corrupt data. */
export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Writes a JSON value to localStorage. No-ops on SSR, private mode, or quota-exceeded. */
export function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Private-mode Safari and quota-exceeded errors are non-fatal — the app just won't persist.
  }
}

export function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // See writeJson.
  }
}
