import { DIETARY_FLAGS } from "@/lib/constants";
import { formatMinutesLabel } from "@/lib/recipe/timers";
import type { DishEntry } from "@/lib/types/recipe";

interface RecipeSummaryProps {
  dish: DishEntry;
}

/** v3 standard Section 19 (difficulty/time/flavor/occasions) plus dietary
 * flags, which existed only as a filter predicate before this — never shown
 * to a reader. Discovery-tier fields only, so this also drops into
 * DiscoveryDetail unchanged if it's ever wired up there. */
export function RecipeSummary({ dish }: RecipeSummaryProps): React.JSX.Element {
  const activeDietary = DIETARY_FLAGS.filter((flag) => dish.dietary[flag.key]);

  return (
    <section className="flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-clay-line py-4 font-meta text-xs text-ink/80">
      <SummaryItem label="Difficulty" value={dish.difficulty} />
      <SummaryItem label="Total time" value={formatMinutesLabel(dish.totalTimeMinutes)} />
      {dish.spiceLevel && <SummaryItem label="Spice level" value={dish.spiceLevel} />}
      {dish.suitableFor && dish.suitableFor.length > 0 && (
        <SummaryItem label="Best for" value={dish.suitableFor.join(", ")} />
      )}
      {activeDietary.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wide text-ink/50">Dietary</span>
          <ul className="flex flex-wrap gap-2">
            {activeDietary.map((flag) => (
              <li key={flag.key} className="border border-clay-line px-2 py-0.5 text-ink">
                {flag.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="uppercase tracking-wide text-ink/50">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
