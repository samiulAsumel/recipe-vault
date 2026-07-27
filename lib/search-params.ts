/** Converts Next's raw async `searchParams` prop (values can be a string, string[], or
 * undefined) into a real URLSearchParams, so pages can reuse the same
 * `parseFiltersFromSearchParams` the API route uses. */
export function toURLSearchParams(raw: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.append(key, value);
    }
  }
  return params;
}
