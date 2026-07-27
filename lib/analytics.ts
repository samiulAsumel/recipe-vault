import type { KVNamespace } from '@cloudflare/workers-types';

const TOTAL_KEY = 'visits:total';
const DAILY_PREFIX = 'visits:daily:';
const COUNTRY_PREFIX = 'visits:country:';
const DISH_PREFIX = 'visits:dish:';

const DAILY_CHART_DAYS = 30;
const TOP_ENTRIES_LIMIT = 10;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** KV has no native increment - this is read-then-write, not atomic. Under concurrent
 * requests to the same key that can under-count by a handful of views; acceptable for a
 * visit counter, same tradeoff Section 10 accepted by choosing plain KV over a Durable Object. */
async function incrementCounter(kv: KVNamespace, key: string): Promise<void> {
  const current = await kv.get(key);
  const next = (current ? Number.parseInt(current, 10) : 0) + 1;
  await kv.put(key, String(next));
}

async function getCounter(kv: KVNamespace, key: string): Promise<number> {
  const value = await kv.get(key);
  return value ? Number.parseInt(value, 10) : 0;
}

export interface TrackPageViewInput {
  countrySlug?: string;
  dishSlug?: string;
}

/** Section 10: increments total/daily, and country/dish counters when applicable. No cookies,
 * no per-visitor identity - matches Section 10's own "privacy-friendly, no GDPR concern"
 * design, though that also means this counts page views, not deduplicated unique visitors
 * (see getAnalyticsSummary's dailyViews doc). */
export async function trackPageView(env: CloudflareEnv, input: TrackPageViewInput): Promise<void> {
  const tasks = [
    incrementCounter(env.ANALYTICS_KV, TOTAL_KEY),
    incrementCounter(env.ANALYTICS_KV, `${DAILY_PREFIX}${todayKey()}`),
  ];
  if (input.countrySlug) {
    tasks.push(incrementCounter(env.ANALYTICS_KV, `${COUNTRY_PREFIX}${input.countrySlug}`));
  }
  if (input.dishSlug) {
    tasks.push(incrementCounter(env.ANALYTICS_KV, `${DISH_PREFIX}${input.dishSlug}`));
  }
  await Promise.all(tasks);
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface TopEntry {
  slug: string;
  count: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  todayViews: number;
  /** Daily page views, oldest first - labelled "views" rather than "unique visitors" because
   * a cookie-free counter can't actually deduplicate visitors; Section 10 asks for both, but
   * those two are in tension given its own "no cookies, no personal data" tracking design. */
  dailyViews: DailyCount[];
  topCountries: TopEntry[];
  topDishes: TopEntry[];
}

function lastNDays(count: number): string[] {
  const dates: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

/** Lists every key under `prefix`, reads each one's counter, and returns the top `limit`.
 * O(N) KV reads where N = distinct countries/dishes ever visited - fine for an admin-only
 * dashboard loaded occasionally, not something to call on a public hot path. */
async function listTopEntries(kv: KVNamespace, prefix: string, limit: number): Promise<TopEntry[]> {
  const entries: TopEntry[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix, cursor });
    const pageEntries = await Promise.all(
      page.keys.map(async (key): Promise<TopEntry> => ({
        slug: key.name.slice(prefix.length),
        count: await getCounter(kv, key.name),
      })),
    );
    entries.push(...pageEntries);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return entries.sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function getAnalyticsSummary(env: CloudflareEnv): Promise<AnalyticsSummary> {
  const kv = env.ANALYTICS_KV;
  const days = lastNDays(DAILY_CHART_DAYS);

  const [totalViews, dailyCounts, topCountries, topDishes] = await Promise.all([
    getCounter(kv, TOTAL_KEY),
    Promise.all(days.map((date) => getCounter(kv, `${DAILY_PREFIX}${date}`))),
    listTopEntries(kv, COUNTRY_PREFIX, TOP_ENTRIES_LIMIT),
    listTopEntries(kv, DISH_PREFIX, TOP_ENTRIES_LIMIT),
  ]);

  const dailyViews = days.map((date, index) => ({ date, count: dailyCounts[index] }));

  return {
    totalViews,
    todayViews: dailyViews[dailyViews.length - 1]?.count ?? 0,
    dailyViews,
    topCountries,
    topDishes,
  };
}
