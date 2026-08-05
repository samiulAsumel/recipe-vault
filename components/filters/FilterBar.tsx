"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { CONTINENTS, DIETARY_FLAGS, MEAL_TIMES } from "@/lib/constants";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import {
  localizeContinentName,
  localizeDietaryLabel,
  localizeOccasionName,
  MEAL_TIME_LABELS,
} from "@/lib/i18n/labels";

const PARAM = {
  dietary: "diet",
  mealTime: "meal",
  occasion: "occasion",
  continent: "continent",
} as const;

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
  /** Only the Search page needs a continent facet — every other page is already
   * continent-scoped (or, for hubs, cross-continent by design). */
  showContinent?: boolean;
}

export function FilterBar({
  occasionOptions,
  hideMealTime = false,
  hideOccasion = false,
  showContinent = false,
}: FilterBarProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictionary(locale);

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
  const continentValues = getValues(PARAM.continent);
  const hasActiveFilters =
    dietaryValues.length + mealValues.length + occasionValues.length + continentValues.length > 0;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-clay-line bg-parchment/90 py-4 backdrop-blur-sm">
      {showContinent && (
        <FilterGroup
          legend={dict.filters.continent}
          options={CONTINENTS.map((continent) => ({
            value: continent.slug,
            label: localizeContinentName(continent.name, locale),
          }))}
          active={continentValues}
          onToggle={(value) => setValues(PARAM.continent, toggleValue(continentValues, value))}
        />
      )}
      <FilterGroup
        legend={dict.filters.dietary}
        options={DIETARY_FLAGS.map((flag) => ({
          value: flag.key,
          label: localizeDietaryLabel(flag.label, locale),
        }))}
        active={dietaryValues}
        onToggle={(value) => setValues(PARAM.dietary, toggleValue(dietaryValues, value))}
      />
      {!hideMealTime && (
        <FilterGroup
          legend={dict.filters.mealTime}
          options={MEAL_TIMES.map((meal) => ({
            value: meal.name,
            label: MEAL_TIME_LABELS[locale][meal.name],
          }))}
          active={mealValues}
          onToggle={(value) => setValues(PARAM.mealTime, toggleValue(mealValues, value))}
        />
      )}
      {!hideOccasion && occasionOptions.length > 0 && (
        <OccasionFilterPopover
          legend={dict.filters.occasion}
          clearLabel={dict.filters.clearOccasion}
          searchPlaceholder={dict.filters.occasionSearchPlaceholder}
          noMatchesLabel={dict.filters.occasionNoMatches}
          options={occasionOptions.map((occasion) => ({
            value: occasion,
            label: localizeOccasionName(occasion, locale),
          }))}
          active={occasionValues}
          onToggle={(value) => setValues(PARAM.occasion, toggleValue(occasionValues, value))}
          onClear={() => setValues(PARAM.occasion, [])}
        />
      )}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="font-meta text-xs text-paprika hover:underline"
        >
          {dict.filters.clearAll}
        </button>
      )}
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  legend: string;
  options: FilterOption[];
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
            className={`rounded-[5px] border px-3 py-1 font-body text-sm transition-colors ${
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

interface OccasionFilterPopoverProps {
  legend: string;
  clearLabel: string;
  searchPlaceholder: string;
  noMatchesLabel: string;
  options: FilterOption[];
  active: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

/** Occasion is a free-form, per-country tag list (India alone has ~60) — showing
 * every tag inline as its own button would dwarf the actual dish grid, so this
 * collapses the whole set behind one disclosure button with an in-panel search
 * instead of following FilterGroup's flat-button pattern. */
function OccasionFilterPopover({
  legend,
  clearLabel,
  searchPlaceholder,
  noMatchesLabel,
  options,
  active,
  onToggle,
  onClear,
}: OccasionFilterPopoverProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={buttonClasses(active.length > 0 ? "primary" : "secondary", "sm", "gap-1.5")}
      >
        {legend}
        {active.length > 0 && <span className="tabular-nums">({active.length})</span>}
        <ChevronDownIcon size={12} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={legend}
          className="absolute left-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-[var(--radius-card)] border border-clay-line bg-surface shadow-[var(--shadow-lift)]"
        >
          <div className="border-b border-clay-line p-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full bg-transparent px-2 py-1.5 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length === 0 && (
              <li className="px-2 py-1.5 font-body text-sm text-ink/50">{noMatchesLabel}</li>
            )}
            {filteredOptions.map((option) => {
              const isActive = active.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onToggle(option.value)}
                    className={`flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left font-body text-sm hover:bg-clay-line/20 ${
                      isActive ? "text-ink" : "text-ink/70"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`h-3.5 w-3.5 shrink-0 rounded-[3px] border ${
                        isActive ? "border-accent-1 bg-accent-1" : "border-clay-line"
                      }`}
                    />
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
          {active.length > 0 && (
            <div className="border-t border-clay-line p-2">
              <button
                type="button"
                onClick={onClear}
                className="font-meta text-xs text-paprika hover:underline"
              >
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
