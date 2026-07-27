import type { Substitution } from '@/types/recipe';

interface SubstitutionsTableProps {
  substitutions: Substitution[];
}

export function SubstitutionsTable({ substitutions }: SubstitutionsTableProps): React.ReactElement | null {
  if (substitutions.length === 0) return null;

  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">Substitutions</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-clay-line text-ink/60">
              <th scope="col" className="py-2 pr-4 font-mono text-xs uppercase tracking-widest">
                Original
              </th>
              <th scope="col" className="py-2 pr-4 font-mono text-xs uppercase tracking-widest">
                Swap
              </th>
              <th scope="col" className="py-2 font-mono text-xs uppercase tracking-widest">
                Impact
              </th>
            </tr>
          </thead>
          <tbody>
            {substitutions.map((substitution) => (
              <tr key={substitution.original} className="border-b border-clay-line/50">
                <td className="py-2 pr-4 font-semibold text-ink">{substitution.original}</td>
                <td className="py-2 pr-4 text-ink">{substitution.swap}</td>
                <td className="py-2 text-ink/70">{substitution.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
