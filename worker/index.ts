// ============================================================================
//  world-kitchen-atlas-proxy  —  Cloudflare Worker
//  Read/write the PRIVATE GitHub repo samiulAsumel/world-kitchen-atlas-data —
//  public read + visit-tracking routes for the static site, admin routes
//  (auth + CRUD) for the /admin panel — without ever exposing the GitHub
//  token client-side.
//
//  Secrets to configure:
//    wrangler secret put GITHUB_TOKEN     fine-grained PAT, Contents: Read & write
//    wrangler secret put SESSION_SECRET   32 random bytes, base64 (openssl rand -base64 32)
//
//  KV binding: ANALYTICS (see wrangler.toml)
//    visits:total / visits:daily:{date} / visits:country:{id} / visits:dish:{id}
//    admin:credentials         — PBKDF2 hash + mustChangePassword + passwordVersion
//    admin:loginfail:{ip}      — failed-login throttle counter, 900s TTL
//
//  Public endpoints:
//    GET  /                                        -> { countries: CountrySummary[] }
//    GET  /dishes                                  -> Dish[] (every country, merged)
//    GET  /countries/{slug}                         -> Dish[]  (+ X-Data-Sha header)
//    GET  /api/track?page=&id=                      -> { ok: true }
//
//  Admin endpoints (Bearer token required; see worker/routes/admin.ts):
//    POST   /admin/login
//    GET    /admin/session
//    POST   /admin/password
//    GET    /admin/countries
//    GET    /admin/countries/{slug}
//    POST   /admin/countries/{slug}/dishes
//    PUT    /admin/countries/{slug}/dishes/{dishSlug}
//    DELETE /admin/countries/{slug}/dishes/{dishSlug}
// ============================================================================

import type { Env } from "./types";
import { CORS, errorResponse } from "./lib/http";
import { handleRoot, handleDishes, handleCountryBySlug, handleTrack } from "./routes/public";
import {
  handleLogin,
  handleSession,
  handlePasswordChange,
  handleAdminCountries,
  handleAdminCountryDetail,
  handleCreateDish,
  handleUpdateDish,
  handleDeleteDish,
} from "./routes/admin";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    try {
      // Public, read-only, GET-only routes.
      if (segments[0] !== "admin") {
        if (request.method !== "GET") {
          return errorResponse(405, "method_not_allowed", "Only GET is supported on this route.");
        }
        if (segments.length === 0) return await handleRoot(env);
        if (segments.length === 1 && segments[0] === "dishes") return await handleDishes(env);
        if (segments.length === 2 && segments[0] === "countries") {
          return await handleCountryBySlug(env, segments[1]);
        }
        if (segments.length === 2 && segments[0] === "api" && segments[1] === "track") {
          return await handleTrack(env, url);
        }
        return errorResponse(404, "not_found", `No route for ${url.pathname}.`);
      }

      // Admin routes — each handler enforces its own auth.
      const [, ...rest] = segments;

      if (request.method === "POST" && rest.length === 1 && rest[0] === "login") {
        return await handleLogin(env, request);
      }
      if (request.method === "GET" && rest.length === 1 && rest[0] === "session") {
        return await handleSession(env, request);
      }
      if (request.method === "POST" && rest.length === 1 && rest[0] === "password") {
        return await handlePasswordChange(env, request);
      }
      if (request.method === "GET" && rest.length === 1 && rest[0] === "countries") {
        return await handleAdminCountries(env, request);
      }
      if (request.method === "GET" && rest.length === 2 && rest[0] === "countries") {
        return await handleAdminCountryDetail(env, request, rest[1]);
      }
      if (request.method === "POST" && rest.length === 3 && rest[0] === "countries" && rest[2] === "dishes") {
        return await handleCreateDish(env, request, rest[1]);
      }
      if (request.method === "PUT" && rest.length === 4 && rest[0] === "countries" && rest[2] === "dishes") {
        return await handleUpdateDish(env, request, rest[1], rest[3]);
      }
      if (request.method === "DELETE" && rest.length === 4 && rest[0] === "countries" && rest[2] === "dishes") {
        return await handleDeleteDish(env, request, rest[1], rest[3]);
      }

      return errorResponse(404, "not_found", `No admin route for ${request.method} ${url.pathname}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return errorResponse(502, "upstream_error", message);
    }
  },
};
