"use client";

import { useEffect, useState } from "react";
import {
  fetchAnalytics,
  type AnalyticsSummary,
  type DailyCount,
  type TopEntry,
} from "@/lib/admin/client";

export function AnalyticsDashboard(): React.JSX.Element {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics()
      .then(setSummary)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      });
  }, []);

  if (error) {
    return <p className="font-body text-sm text-paprika">{error}</p>;
  }
  if (!summary) {
    return <p className="font-body text-sm text-ink/60">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:max-w-lg sm:grid-cols-4">
        <StatTile label="Total views" value={summary.total} />
        <StatTile label="Views today" value={summary.today} />
        <StatTile label="Unique today" value={summary.uniqueToday} />
        <StatTile label="Unique total" value={summary.uniqueTotal} />
      </div>

      <DailyChart daily={summary.daily} />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <TopList title="Top countries" entries={summary.topCountries} />
        <TopList title="Top dishes" entries={summary.topDishes} />
        <TopList title="Visitor geography" entries={summary.topGeo} />
        <TopList title="Top referrers" entries={summary.topReferrers} />
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }): React.JSX.Element {
  return (
    <div className="border border-clay-line p-4">
      <div className="font-meta text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-1 font-meta text-3xl text-ink">{value.toLocaleString()}</div>
    </div>
  );
}

function TopList({ title, entries }: { title: string; entries: TopEntry[] }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {entries.length === 0 ? (
        <p className="font-body text-sm text-ink/60">No data yet.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {entries.map((entry, index) => (
            <li
              key={entry.slug}
              className="flex items-center justify-between font-body text-sm text-ink/80"
            >
              <span>
                {index + 1}. {entry.slug}
              </span>
              <span className="font-meta text-xs text-ink/60">{entry.count.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 160;
const CHART_PADDING = 24;
const GRID_FRACTIONS = [0.25, 0.5, 0.75, 1];

function DailyChart({ daily }: { daily: DailyCount[] }): React.JSX.Element {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.views));
  const innerWidth = CHART_WIDTH - CHART_PADDING * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING * 2;

  const toX = (index: number): number =>
    CHART_PADDING + (daily.length === 1 ? 0 : (index / (daily.length - 1)) * innerWidth);
  const toY = (count: number): number => CHART_HEIGHT - CHART_PADDING - (count / max) * innerHeight;

  const points = daily.map((d, index) => ({ ...d, x: toX(index), y: toY(d.views) }));
  const visitorPoints = daily.map((d, index) => ({ ...d, x: toX(index), y: toY(d.visitors) }));

  const viewsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const visitorsPath = visitorPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;
    let nearest = 0;
    let nearestDistance = Infinity;
    points.forEach((point, index) => {
      const distance = Math.abs(point.x - relativeX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink">Last 30 days</h3>
        <div className="flex items-center gap-4 font-meta text-xs text-ink/60">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 bg-turmeric" /> Views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 bg-cardamom" /> Unique visitors
          </span>
        </div>
      </div>
      <div className="relative border border-clay-line p-4">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Daily views and unique visitors over the last 30 days"
        >
          {GRID_FRACTIONS.map((fraction) => (
            <line
              key={fraction}
              x1={CHART_PADDING}
              x2={CHART_WIDTH - CHART_PADDING}
              y1={CHART_HEIGHT - CHART_PADDING - fraction * innerHeight}
              y2={CHART_HEIGHT - CHART_PADDING - fraction * innerHeight}
              stroke="var(--clay-line)"
              strokeWidth={1}
            />
          ))}
          <path
            d={visitorsPath}
            fill="none"
            stroke="var(--cardamom)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={viewsPath}
            fill="none"
            stroke="var(--turmeric)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hovered && (
            <>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={CHART_PADDING}
                y2={CHART_HEIGHT - CHART_PADDING}
                stroke="var(--ink)"
                strokeOpacity={0.2}
                strokeWidth={1}
              />
              <circle
                cx={hovered.x}
                cy={hovered.y}
                r={4}
                fill="var(--turmeric)"
                stroke="var(--parchment)"
                strokeWidth={2}
              />
              <circle
                cx={visitorPoints[hoverIndex ?? 0].x}
                cy={visitorPoints[hoverIndex ?? 0].y}
                r={4}
                fill="var(--cardamom)"
                stroke="var(--parchment)"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
        {hovered && (
          <div
            className="pointer-events-none absolute top-2 border border-clay-line bg-parchment px-2 py-1 font-meta text-xs text-ink"
            style={{ left: `${(hovered.x / CHART_WIDTH) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="text-ink/60">{hovered.date}</div>
            <div className="font-medium">{hovered.views.toLocaleString()} views</div>
            <div className="font-medium">{hovered.visitors.toLocaleString()} unique</div>
          </div>
        )}
      </div>
      <details className="font-body text-sm text-ink/70">
        <summary className="cursor-pointer font-meta text-xs uppercase tracking-wide text-ink/50">
          View as table
        </summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-clay-line font-meta text-xs uppercase text-ink/50">
              <th className="py-1 font-medium">Date</th>
              <th className="py-1 font-medium">Views</th>
              <th className="py-1 font-medium">Unique</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((d) => (
              <tr key={d.date} className="border-b border-clay-line/50">
                <td className="py-1 font-meta text-xs text-ink/80">{d.date}</td>
                <td className="py-1 font-meta text-xs text-ink/80">{d.views}</td>
                <td className="py-1 font-meta text-xs text-ink/80">{d.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
