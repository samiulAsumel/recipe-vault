import { DurableObject } from "cloudflare:workers";
import type { Env } from "./types";

export type PageKind = "home" | "continent" | "country" | "dish" | "other";

export interface VisitInput {
  date: string;
  fingerprint: string;
  page: PageKind;
  slug?: string;
  country?: string;
  referrerHost?: string;
}

export interface DailyCount {
  date: string;
  views: number;
  visitors: number;
}

export interface TopEntry {
  slug: string;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  today: number;
  uniqueToday: number;
  uniqueTotal: number;
  daily: DailyCount[];
  topCountries: TopEntry[];
  topDishes: TopEntry[];
  topGeo: TopEntry[];
  topReferrers: TopEntry[];
}

// "seen" is the only table that grows per-request rather than per distinct
// key, so it is the only one pruned. A 2-day window is enough to dedupe
// "today" while tolerating requests that land just after UTC midnight.
const SEEN_RETENTION_DAYS = 2;

function last30Dates(): string[] {
  const dates: string[] = [];
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - offset);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function isoDateMinusDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export class VisitCounter extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    // blockConcurrencyWhile ensures no record()/summary() call runs against
    // these tables before they exist, even if requests arrive on cold start.
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec(`
        CREATE TABLE IF NOT EXISTS daily (
          date TEXT PRIMARY KEY,
          views INTEGER NOT NULL DEFAULT 0,
          visitors INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS pages (
          kind TEXT NOT NULL,
          slug TEXT NOT NULL,
          views INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (kind, slug)
        );
        CREATE TABLE IF NOT EXISTS geo (
          country TEXT PRIMARY KEY,
          views INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS referrers (
          host TEXT PRIMARY KEY,
          views INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS seen (
          date TEXT NOT NULL,
          fingerprint TEXT NOT NULL,
          PRIMARY KEY (date, fingerprint)
        );
      `);
    });
  }

  async record(visit: VisitInput): Promise<void> {
    const { date, fingerprint, page, slug, country, referrerHost } = visit;

    this.sql.exec(
      `INSERT INTO daily (date, views, visitors) VALUES (?, 1, 0)
       ON CONFLICT(date) DO UPDATE SET views = views + 1`,
      date,
    );

    // "seen" dedupes visitors per day; changes() tells us whether this
    // fingerprint was actually new (INSERT OR IGNORE is a no-op on repeats).
    this.sql.exec("INSERT OR IGNORE INTO seen (date, fingerprint) VALUES (?, ?)", date, fingerprint);
    const { n } = this.sql.exec<{ n: number }>("SELECT changes() as n").one();
    if (n === 1) {
      this.sql.exec("UPDATE daily SET visitors = visitors + 1 WHERE date = ?", date);
    }
    this.sql.exec("DELETE FROM seen WHERE date < ?", isoDateMinusDays(date, SEEN_RETENTION_DAYS));

    if ((page === "country" || page === "dish") && slug) {
      this.sql.exec(
        `INSERT INTO pages (kind, slug, views) VALUES (?, ?, 1)
         ON CONFLICT(kind, slug) DO UPDATE SET views = views + 1`,
        page,
        slug,
      );
    }

    if (country) {
      this.sql.exec(
        `INSERT INTO geo (country, views) VALUES (?, 1)
         ON CONFLICT(country) DO UPDATE SET views = views + 1`,
        country,
      );
    }

    if (referrerHost) {
      this.sql.exec(
        `INSERT INTO referrers (host, views) VALUES (?, 1)
         ON CONFLICT(host) DO UPDATE SET views = views + 1`,
        referrerHost,
      );
    }
  }

  async summary(): Promise<AnalyticsSummary> {
    const dates = last30Dates();

    const dailyRows = this.sql
      .exec<{ date: string; views: number; visitors: number }>(
        "SELECT date, views, visitors FROM daily WHERE date >= ? ORDER BY date",
        dates[0],
      )
      .toArray();
    const byDate = new Map(dailyRows.map((row) => [row.date, row]));
    const daily: DailyCount[] = dates.map((date) => {
      const row = byDate.get(date);
      return { date, views: row?.views ?? 0, visitors: row?.visitors ?? 0 };
    });
    const today = daily[daily.length - 1];

    const totals = this.sql
      .exec<{ total: number; uniqueTotal: number }>(
        "SELECT COALESCE(SUM(views), 0) as total, COALESCE(SUM(visitors), 0) as uniqueTotal FROM daily",
      )
      .one();

    const topCountries = this.sql
      .exec<{ slug: string; count: number }>(
        "SELECT slug, views as count FROM pages WHERE kind = 'country' ORDER BY views DESC LIMIT 10",
      )
      .toArray();
    const topDishes = this.sql
      .exec<{ slug: string; count: number }>(
        "SELECT slug, views as count FROM pages WHERE kind = 'dish' ORDER BY views DESC LIMIT 10",
      )
      .toArray();
    const topGeo = this.sql
      .exec<{ slug: string; count: number }>(
        "SELECT country as slug, views as count FROM geo ORDER BY views DESC LIMIT 10",
      )
      .toArray();
    const topReferrers = this.sql
      .exec<{ slug: string; count: number }>(
        "SELECT host as slug, views as count FROM referrers ORDER BY views DESC LIMIT 10",
      )
      .toArray();

    return {
      total: totals.total,
      today: today.views,
      uniqueToday: today.visitors,
      uniqueTotal: totals.uniqueTotal,
      daily,
      topCountries,
      topDishes,
      topGeo,
      topReferrers,
    };
  }
}
