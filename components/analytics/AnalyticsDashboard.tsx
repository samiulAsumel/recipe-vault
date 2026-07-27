import { DailyViewsChart } from '@/components/analytics/DailyViewsChart';
import { TopEntriesList } from '@/components/analytics/TopEntriesList';
import type { AnalyticsSummary } from '@/lib/analytics';

interface AnalyticsDashboardProps {
  summary: AnalyticsSummary;
}

/** Section 10/12: the Analytics tab's contents - total visits, 30-day daily chart, top 10
 * countries, top 10 dishes, today's live count. Hero figures use font-mono (not display/serif -
 * dataviz skill's hero-figure rule, and matches Section 2's own "measured data" rationale for
 * monospace) with default proportional figures, not tabular-nums (that's reserved for aligned
 * columns, like the top-10 lists' rank/count). */
export function AnalyticsDashboard({ summary }: AnalyticsDashboardProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="border border-clay-line p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">Total views</p>
          <p className="mt-2 font-mono text-5xl text-ink">{summary.totalViews.toLocaleString()}</p>
        </div>
        <div className="border border-clay-line p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">Today</p>
          <p className="mt-2 font-mono text-5xl text-turmeric">{summary.todayViews.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">
          Daily views — last 30 days
        </h2>
        <div className="mt-3">
          <DailyViewsChart data={summary.dailyViews} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <TopEntriesList title="Top 10 countries" entries={summary.topCountries} />
        <TopEntriesList title="Top 10 dishes" entries={summary.topDishes} />
      </div>
    </div>
  );
}
