import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { NextRequest } from 'next/server';
import { trackPageView } from '@/lib/analytics';

/** Section 10: "a lightweight Worker endpoint hit on every page load ... increments a KV
 * counter, no cookie/personal-data store." Always 204, even on internal failure - a tracking
 * beacon must never surface as a visible error to the visitor. */
export async function GET(request: NextRequest): Promise<Response> {
  const { env } = getCloudflareContext();
  const { searchParams } = request.nextUrl;

  const page = searchParams.get('page');
  const countrySlug = page === 'country' || page === 'dish' ? (searchParams.get('country') ?? undefined) : undefined;
  const dishSlug = page === 'dish' ? (searchParams.get('id') ?? undefined) : undefined;

  try {
    await trackPageView(env, { countrySlug, dishSlug });
  } catch (error) {
    console.error('Failed to track page view', error);
  }

  return new Response(null, { status: 204 });
}
