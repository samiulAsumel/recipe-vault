'use client';

import { useMemo, useState } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { DishCard } from '@/components/DishCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchQueryInput } from '@/components/search/SearchQueryInput';
import type { Recipe } from '@/types/recipe';

interface SearchExperienceProps {
  recipes: Recipe[];
  initialQuery: string;
  selectedContinents: string[];
  selectedMealTimes: string[];
  selectedDiets: string[];
  availableOccasions: string[];
  selectedOccasions: string[];
}

const FUSE_OPTIONS: IFuseOptions<Recipe> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'country', weight: 0.2 },
    { name: 'shortDescription', weight: 0.2 },
    { name: 'historicNote', weight: 0.1 },
    { name: 'whenEaten', weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

/** Keeps `q` visible/shareable in the address bar without going through Next's router - a
 * router.replace/push would re-run the search Server Component (and re-fetch every recipe
 * from GitHub) on every keystroke, defeating the entire point of client-side Fuse.js. */
function syncQueryToUrl(query: string): void {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set('q', query);
  } else {
    url.searchParams.delete('q');
  }
  window.history.replaceState({}, '', url);
}

/** Section 8/9: Fuse.js runs entirely client-side. The checkbox facets (continent/mealTime/
 * diet/occasion) still go through the shared FilterBar's native GET form - the server
 * re-fetches and re-filters on submit, same as Country/Meal-Time/Occasion pages. Only the free
 * -text query is instant, filtering whatever facet-filtered set the server already sent down. */
export function SearchExperience({
  recipes,
  initialQuery,
  selectedContinents,
  selectedMealTimes,
  selectedDiets,
  availableOccasions,
  selectedOccasions,
}: SearchExperienceProps): React.ReactElement {
  const [query, setQuery] = useState(initialQuery);
  const fuse = useMemo(() => new Fuse(recipes, FUSE_OPTIONS), [recipes]);

  const trimmedQuery = query.trim();
  const results = trimmedQuery ? fuse.search(trimmedQuery).map((result) => result.item) : recipes;

  return (
    <div>
      <FilterBar
        action="/search"
        showContinentFilter
        selectedContinents={selectedContinents}
        selectedMealTimes={selectedMealTimes}
        selectedDiets={selectedDiets}
        availableOccasions={availableOccasions}
        selectedOccasions={selectedOccasions}
      >
        <SearchQueryInput
          query={query}
          onQueryChange={(next) => {
            setQuery(next);
            syncQueryToUrl(next);
          }}
        />
      </FilterBar>

      <p className="mt-4 font-mono text-xs text-ink/50">
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </p>

      <div className="mt-4">
        {results.length === 0 ? (
          <p className="text-ink/60">No dishes match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((recipe) => (
              <DishCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
