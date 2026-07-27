import type { TopEntry } from '@/lib/analytics';

interface TopEntriesListProps {
  title: string;
  entries: TopEntry[];
}

export function TopEntriesList({ title, entries }: TopEntriesListProps): React.ReactElement {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink/60">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-ink/50">No views recorded yet.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-1.5">
          {entries.map((entry, index) => (
            <li key={entry.slug} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex items-baseline gap-2 text-ink">
                <span className="font-mono text-xs tabular-nums text-ink/40">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {entry.slug}
              </span>
              <span className="font-mono text-xs tabular-nums text-ink/60">{entry.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
