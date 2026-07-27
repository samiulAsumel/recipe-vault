import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Metadata } from 'next';
import { SearchExperience } from '@/components/search/SearchExperience';
import { fetchAllRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { matchesFilters, parseFiltersFromSearchParams } from '@/lib/recipe-filters';
import { toURLSearchParams } from '@/lib/search-params';
import type { Recipe } from '@/types/recipe';

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Every filter/query combination lives at /search?... - canonicalize to the bare path and
 * keep it out of the index entirely, or Google ends up indexing thousands of near-duplicate
 * filter permutations (exactly the "duplicate-content issue" Section 7 calls out). */
export const metadata: Metadata = {
  title: 'Search',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true },
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<React.ReactElement> {
  const rawSearchParams = await searchParams;
  const { env } = getCloudflareContext();

  let allRecipes: Recipe[] = [];
  let statusMessage: string | null = null;

  try {
    allRecipes = await fetchAllRecipes(env);
  } catch (error) {
    if (error instanceof GithubConfigError) {
      statusMessage = 'This atlas is not connected to a recipe source yet.';
    } else if (error instanceof GithubDataError) {
      console.error('Failed to load search index', error);
      statusMessage = 'Could not load the recipe index right now.';
    } else {
      throw error;
    }
  }

  const filters = parseFiltersFromSearchParams(toURLSearchParams(rawSearchParams));
  const facetFilteredRecipes = allRecipes.filter((recipe) => matchesFilters(recipe, filters));
  const availableOccasions = [...new Set(allRecipes.flatMap((recipe) => recipe.occasion))].sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <main className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-turmeric">Search</p>
        <h1 className="mt-2 font-display text-5xl">Find a dish</h1>

        {statusMessage ? (
          <p className="mt-10 text-ink/60">{statusMessage}</p>
        ) : (
          <div className="mt-8">
            <SearchExperience
              recipes={facetFilteredRecipes}
              initialQuery={firstValue(rawSearchParams.q)}
              selectedContinents={filters.continent ?? []}
              selectedMealTimes={filters.mealTime ?? []}
              selectedDiets={filters.diet ?? []}
              availableOccasions={availableOccasions}
              selectedOccasions={filters.occasion ?? []}
            />
          </div>
        )}
      </div>
    </main>
  );
}
