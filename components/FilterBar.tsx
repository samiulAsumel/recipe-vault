import {
  CONTINENT_LABELS,
  CONTINENT_SLUGS,
  DIETARY_KEYS,
  DIETARY_LABELS,
  MEAL_TIME_LABELS,
  MEAL_TIME_SLUGS,
} from '@/lib/constants';

interface FilterBarProps {
  action: string;
  selectedMealTimes: string[];
  selectedDiets: string[];
  availableOccasions: string[];
  selectedOccasions: string[];
  /** Section 5: only the Search page's filter sidebar includes continent - Country/Meal-Time/
   * Occasion hub pages already scope to a continent (or cross all of them) some other way. */
  showContinentFilter?: boolean;
  selectedContinents?: string[];
  /** Lets the Search page inject its live query input into this same native form, so
   * "Apply filters" submits the search text and the checkboxes together. */
  children?: React.ReactNode;
}

/** Section 6: "same filter bar component reused on Country page, Meal-Time hub, Occasion hub,
 * and Search page — build it once as a shared component". Plain GET form so filtering works
 * with no client JS; mealTime/diet/continent are fixed enums, occasion is derived from whichever
 * values actually appear in the current recipe set. */
export function FilterBar({
  action,
  selectedMealTimes,
  selectedDiets,
  availableOccasions,
  selectedOccasions,
  showContinentFilter = false,
  selectedContinents = [],
  children,
}: FilterBarProps): React.ReactElement {
  return (
    <form
      method="GET"
      action={action}
      className="sticky top-0 z-10 flex flex-wrap items-start gap-6 border-b border-clay-line bg-parchment/95 py-4 backdrop-blur-sm"
    >
      {children}

      {showContinentFilter && (
        <fieldset className="flex flex-wrap items-center gap-3">
          <legend className="mb-1 w-full font-mono text-xs uppercase tracking-widest text-ink/60">
            Continent
          </legend>
          {CONTINENT_SLUGS.map((slug) => (
            <label key={slug} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
                name="continent"
                value={slug}
                defaultChecked={selectedContinents.includes(slug)}
                className="accent-[var(--accent-1)]"
              />
              {CONTINENT_LABELS[slug]}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="mb-1 w-full font-mono text-xs uppercase tracking-widest text-ink/60">
          Meal time
        </legend>
        {MEAL_TIME_SLUGS.map((slug) => (
          <label key={slug} className="flex items-center gap-1.5 text-sm text-ink">
            <input
              type="checkbox"
              name="mealTime"
              value={slug}
              defaultChecked={selectedMealTimes.includes(slug)}
              className="accent-[var(--accent-1)]"
            />
            {MEAL_TIME_LABELS[slug]}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="mb-1 w-full font-mono text-xs uppercase tracking-widest text-ink/60">
          Dietary
        </legend>
        {DIETARY_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-1.5 text-sm text-ink">
            <input
              type="checkbox"
              name="diet"
              value={key}
              defaultChecked={selectedDiets.includes(key)}
              className="accent-[var(--accent-1)]"
            />
            {DIETARY_LABELS[key]}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="mb-1 w-full font-mono text-xs uppercase tracking-widest text-ink/60">
          Occasion
        </legend>
        {availableOccasions.length === 0 ? (
          <span className="text-sm text-ink/50">None yet</span>
        ) : (
          availableOccasions.map((occasion) => (
            <label key={occasion} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
                name="occasion"
                value={occasion}
                defaultChecked={selectedOccasions.includes(occasion)}
                className="accent-[var(--accent-1)]"
              />
              {occasion}
            </label>
          ))
        )}
      </fieldset>

      <button
        type="submit"
        className="ml-auto self-start border border-clay-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:border-[var(--accent-1)]"
      >
        Apply filters
      </button>
    </form>
  );
}
