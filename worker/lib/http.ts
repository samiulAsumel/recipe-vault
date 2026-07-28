export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Expose-Headers": "X-Data-Sha, X-Session-Token",
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, max-age=60", ...extra },
  });
}

export function errorResponse(
  status: number,
  error: string,
  message: string,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });
}
