import { getPublicDataApiUrl } from "@/lib/env";
import type { DishEntry, CountrySummary } from "@/lib/types/recipe";
import { getStoredSession, setStoredSession, clearStoredSession } from "./session";

export interface ValidationIssue {
  field: string;
  message: string;
}

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: string,
    message: string,
    public readonly details?: ValidationIssue[],
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export class UnauthorizedError extends AdminApiError {
  constructor(message: string) {
    super(401, "unauthorized", message);
    this.name = "UnauthorizedError";
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = getStoredSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!options.skipAuth) {
    if (!session) throw new UnauthorizedError("No active session.");
    headers.Authorization = `Bearer ${session.token}`;
  }

  const res = await fetch(`${getPublicDataApiUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const renewedToken = res.headers.get("X-Session-Token");
  if (renewedToken && session) {
    setStoredSession(renewedToken, session.expiresAt);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredSession();
      throw new UnauthorizedError(body.message ?? "Session expired.");
    }
    throw new AdminApiError(res.status, body.error ?? "unknown_error", body.message ?? "Request failed.", body.details);
  }

  return body as T;
}

export interface LoginResponse {
  token: string;
  expiresAt: number;
  mustChangePassword: boolean;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const result = await request<LoginResponse>("/admin/login", {
    method: "POST",
    body: { username, password },
    skipAuth: true,
  });
  setStoredSession(result.token, result.expiresAt);
  return result;
}

export interface SessionResponse {
  username: string;
  expiresAt: number;
  mustChangePassword: boolean;
}

export function fetchSession(): Promise<SessionResponse> {
  return request<SessionResponse>("/admin/session");
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const result = await request<{ token: string; expiresAt: number }>("/admin/password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
  setStoredSession(result.token, result.expiresAt);
}

export function logout(): void {
  clearStoredSession();
}

export interface AdminCountriesResponse {
  countries: CountrySummary[];
  countryFiles: string[];
}

export function listCountries(): Promise<AdminCountriesResponse> {
  return request<AdminCountriesResponse>("/admin/countries");
}

export interface CountryDetailResponse {
  dishes: DishEntry[];
  sha: string | null;
}

export function getCountryDishes(countrySlug: string): Promise<CountryDetailResponse> {
  return request<CountryDetailResponse>(`/admin/countries/${countrySlug}`);
}

export interface DishWriteResponse {
  dish: DishEntry;
  sha: string;
}

export function createDish(
  countrySlug: string,
  dish: DishEntry,
  expectedSha: string | null,
): Promise<DishWriteResponse> {
  return request<DishWriteResponse>(`/admin/countries/${countrySlug}/dishes`, {
    method: "POST",
    body: { dish, expectedSha: expectedSha ?? undefined },
  });
}

export function updateDish(
  countrySlug: string,
  dishSlug: string,
  dish: DishEntry,
  expectedSha: string | null,
): Promise<DishWriteResponse> {
  return request<DishWriteResponse>(`/admin/countries/${countrySlug}/dishes/${dishSlug}`, {
    method: "PUT",
    body: { dish, expectedSha: expectedSha ?? undefined },
  });
}

export function deleteDish(countrySlug: string, dishSlug: string, expectedSha: string | null): Promise<void> {
  return request<void>(`/admin/countries/${countrySlug}/dishes/${dishSlug}`, {
    method: "DELETE",
    body: { expectedSha: expectedSha ?? undefined },
  });
}

// Mirrors worker/lib/analytics.ts's AnalyticsSummary — duplicated, not imported,
// same reason the worker duplicates DishEntry (see worker/types.ts): the worker
// bundles independently and doesn't share this app's tsconfig path aliases.
export interface DailyCount {
  date: string;
  count: number;
}

export interface TopEntry {
  slug: string;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  today: number;
  daily: DailyCount[];
  topCountries: TopEntry[];
  topDishes: TopEntry[];
}

export function fetchAnalytics(): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>("/admin/analytics");
}
