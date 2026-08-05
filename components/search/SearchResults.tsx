"use client";

import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DishGrid } from "@/components/dish/DishGrid";
import { FilterBar } from "@/components/filters/FilterBar";
import { Button } from "@/components/ui/Button";
import type { ContinentSlug } from "@/lib/constants";
import { filterDishes, matchesFilters, type DishFilters } from "@/lib/data/filters";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import type { DietaryFlags, DishEntry, MealTime } from "@/lib/types/recipe";

interface SearchResultsProps {
  dishes: DishEntry[];
}

function parseFilters(params: URLSearchParams): DishFilters {
  const meal = params.get("meal");
  const diet = params.get("diet");
  const continent = params.get("continent");
  return {
    mealTime: meal ? (meal.split(",") as MealTime[]) : undefined,
    dietary: diet ? (diet.split(",") as Array<keyof DietaryFlags>) : undefined,
    continentSlugs: continent ? (continent.split(",") as ContinentSlug[]) : undefined,
  };
}

export function SearchResults({ dishes }: SearchResultsProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
  const dict = getDictionary(locale);
  const query = searchParams.get("q")?.trim() ?? "";

  // Resets the input when `q` changes from outside (back/forward, a fresh link)
  // without fighting local edits while typing — React's "adjust state during
  // render" pattern, not an effect, so there's no extra render round-trip.
  const [previousQuery, setPreviousQuery] = useState(query);
  const [queryInput, setQueryInput] = useState(query);
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setQueryInput(query);
  }

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // Built once per dataset — structured filters are applied as a post-filter over
  // Fuse's ranked output below, rather than re-indexing per filter change.
  // Bengali pages search the Bengali fields (falling back to English when a
  // dish isn't translated yet) plus nativeName, rather than the English-only
  // fields — matches by name/country/description alone previously ignored
  // both nativeName and any translated content entirely.
  const fuse = useMemo(
    () =>
      new Fuse(dishes, {
        keys:
          locale === "bn"
            ? [
                { name: "name", weight: 2, getFn: (dish: DishEntry) => dish.translations?.bn?.name ?? dish.name },
                { name: "nativeName", weight: 1.5 },
                { name: "country", weight: 1 },
                {
                  name: "shortDescription",
                  weight: 0.5,
                  getFn: (dish: DishEntry) => dish.translations?.bn?.shortDescription ?? dish.shortDescription,
                },
              ]
            : [
                { name: "name", weight: 2 },
                { name: "country", weight: 1 },
                { name: "shortDescription", weight: 0.5 },
              ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [dishes, locale],
  );

  // With an active query, Fuse's relevance ranking is the point — DishGrid is
  // told to preserve it via `preserveOrder`. With no query, DishGrid applies
  // its own locale-aware alphabetical sort, so no sorting happens here.
  const results = useMemo(() => {
    if (query) {
      return fuse
        .search(query)
        .map((result) => result.item)
        .filter((dish) => matchesFilters(dish, filters));
    }
    return filterDishes(dishes, filters);
  }, [dishes, filters, fuse, query]);

  function submitQuery(next: string): void {
    const trimmed = next.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuery(queryInput);
        }}
        className="flex w-full max-w-xl items-center overflow-hidden rounded-[5px] border border-clay-line bg-surface focus-within:border-turmeric"
      >
        <label htmlFor="search-results-query" className="sr-only">
          {dict.search.srLabel}
        </label>
        <input
          id="search-results-query"
          type="search"
          value={queryInput}
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder={dict.search.placeholder}
          className="w-full bg-transparent px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <Button type="submit" variant="primary" className="rounded-none border-l border-clay-line px-5 py-3">
          {dict.search.submit}
        </Button>
      </form>

      <FilterBar showContinent />
      <DishGrid
        dishes={results}
        emptyMessage={query ? dict.search.noResultsForQuery(query) : dict.search.noResultsFilters}
        locale={locale}
        preserveOrder={Boolean(query)}
      />
    </div>
  );
}
