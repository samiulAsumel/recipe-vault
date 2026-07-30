import { DIETARY_FLAGS } from "@/lib/constants";
import { getDictionary, type Locale } from "@/lib/i18n";
import { DIFFICULTY_LABELS, localizeDietaryLabel, SPICE_LEVEL_LABELS } from "@/lib/i18n/labels";
import { formatMinutesLabel } from "@/lib/recipe/timers";
import type { DishEntry } from "@/lib/types/recipe";

interface RecipeSummaryProps {
  dish: DishEntry;
  locale?: Locale;
}

/** v3 standard Section 19 (difficulty/time/flavor/occasions) plus dietary
 * flags, which existed only as a filter predicate before this — never shown
 * to a reader. Discovery-tier fields only, so this also drops into
 * DiscoveryDetail unchanged if it's ever wired up there. */
export function RecipeSummary({ dish, locale = "en" }: RecipeSummaryProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const activeDietary = DIETARY_FLAGS.filter((flag) => dish.dietary[flag.key]);
  const suitableFor =
    locale === "bn" ? (dish.translations?.bn?.suitableFor ?? dish.suitableFor) : dish.suitableFor;

  return (
    <section className="flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-clay-line py-4 font-meta text-xs text-ink/80">
      <SummaryItem label={dict.recipeSummary.difficulty} value={DIFFICULTY_LABELS[locale][dish.difficulty]} />
      <SummaryItem
        label={dict.recipeSummary.totalTime}
        value={formatMinutesLabel(dish.totalTimeMinutes, locale)}
      />
      {dish.spiceLevel && (
        <SummaryItem label={dict.recipeSummary.spiceLevel} value={SPICE_LEVEL_LABELS[locale][dish.spiceLevel]} />
      )}
      {suitableFor && suitableFor.length > 0 && (
        <SummaryItem label={dict.recipeSummary.bestFor} value={suitableFor.join(", ")} />
      )}
      {activeDietary.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wide text-ink/50">{dict.recipeSummary.dietary}</span>
          <ul className="flex flex-wrap gap-2">
            {activeDietary.map((flag) => (
              <li key={flag.key} className="border border-clay-line px-2 py-0.5 text-ink">
                {localizeDietaryLabel(flag.label, locale)}
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
