"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DIETARY_FLAGS, MEAL_TIMES } from "@/lib/constants";

const PARAM = { dietary: "diet", mealTime: "meal", occasion: "occasion" } as const;

function toggleValue(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

interface FilterBarProps {
  /** Occasion tags actually present in the current dataset — occasion is free-form
   * per Section 4, so options are derived from the data, not a fixed list. */
  occasionOptions: string[];
  /** Hide a category when it's already the hub page's own fixed criterion — e.g.
   * the Breakfast hub has no use for a "Meal time" filter row of its own axis. */
  hideMealTime?: boolean;
  hideOccasion?: boolean;
}

export function FilterBar({
  occasionOptions,
  hideMealTime = false,
  hideOccasion = false,
}: FilterBarProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getValues = (param: string): string[] => {
    const raw = searchParams.get(param);
    return raw ? raw.split(",") : [];
  };

  const setValues = useCallback(
    (param: string, values: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      if (values.length > 0) {
        next.set(param, values.join(","));
      } else {
        next.delete(param);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const dietaryValues = getValues(PARAM.dietary);
  const mealValues = getValues(PARAM.mealTime);
  const occasionValues = getValues(PARAM.occasion);
  const hasActiveFilters = dietaryValues.length + mealValues.length + occasionValues.length > 0;

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-clay-line bg-parchment/95 py-4 backdrop-blur-sm">
      <FilterGroup
        legend="Dietary"
        options={DIETARY_FLAGS.map((flag) => ({ value: flag.key, label: flag.label }))}
        active={dietaryValues}
        onToggle={(value) => setValues(PARAM.dietary, toggleValue(dietaryValues, value))}
      />
      {!hideMealTime && (
        <FilterGroup
          legend="Meal time"
          options={MEAL_TIMES.map((meal) => ({ value: meal.name, label: meal.name }))}
          active={mealValues}
          onToggle={(value) => setValues(PARAM.mealTime, toggleValue(mealValues, value))}
        />
      )}
      {!hideOccasion && occasionOptions.length > 0 && (
        <FilterGroup
          legend="Occasion"
          options={occasionOptions.map((occasion) => ({ value: occasion, label: occasion }))}
          active={occasionValues}
          onToggle={(value) => setValues(PARAM.occasion, toggleValue(occasionValues, value))}
        />
      )}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="self-start font-meta text-xs text-paprika hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

interface FilterGroupProps {
  legend: string;
  options: Array<{ value: string; label: string }>;
  active: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ legend, options, active, onToggle }: FilterGroupProps): React.JSX.Element {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mr-2 font-meta text-xs uppercase tracking-wide text-ink/50">
        {legend}
      </legend>
      {options.map((option) => {
        const isActive = active.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(option.value)}
            className={`border px-3 py-1 font-body text-sm transition-colors ${
              isActive
                ? "border-accent-1 bg-accent-1/10 text-ink"
                : "border-clay-line text-ink/70 hover:border-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
