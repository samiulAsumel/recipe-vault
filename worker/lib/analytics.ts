// KV has no atomic increment — this get-then-put can under-count on truly
// concurrent hits, an accepted tradeoff of the KV-for-counters design Section
// 10 explicitly chose over a more complex mechanism (e.g. a Durable Object).
export async function incrementKvCounter(kv: KVNamespace, key: string): Promise<void> {
  const current = await kv.get(key);
  const next = (Number(current) || 0) + 1;
  await kv.put(key, String(next));
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
  total: number;
  today: number;
  daily: DailyCount[];
  topCountries: TopEntry[];
  topDishes: TopEntry[];
}

function last30Dates(): string[] {
  const dates: string[] = [];
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - offset);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function topEntriesByPrefix(kv: KVNamespace, prefix: string, limit = 10): Promise<TopEntry[]> {
  const { keys } = await kv.list({ prefix });
  const entries = await Promise.all(
    keys.map(async (key) => ({
      slug: key.name.slice(prefix.length),
      count: Number((await kv.get(key.name)) ?? "0"),
    })),
  );
  return entries.sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function getAnalyticsSummary(kv: KVNamespace): Promise<AnalyticsSummary> {
  const dates = last30Dates();

  const [total, dailyCounts, topCountries, topDishes] = await Promise.all([
    kv.get("visits:total").then((v) => Number(v ?? "0")),
    Promise.all(dates.map((date) => kv.get(`visits:daily:${date}`).then((v) => Number(v ?? "0")))),
    topEntriesByPrefix(kv, "visits:country:"),
    topEntriesByPrefix(kv, "visits:dish:"),
  ]);

  return {
    total,
    today: dailyCounts[dailyCounts.length - 1] ?? 0,
    daily: dates.map((date, i) => ({ date, count: dailyCounts[i] })),
    topCountries,
    topDishes,
  };
}
