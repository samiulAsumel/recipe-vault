import { getCloudflareContext } from '@opennextjs/cloudflare';
import { RecipeGridSection } from '@/components/RecipeGridSection';
import { OCCASION_HUB_LABELS, type OccasionHubSlug } from '@/lib/constants';
import { fetchAllRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { matchesFilters, parseFiltersFromSearchParams } from '@/lib/recipe-filters';
import { toURLSearchParams } from '@/lib/search-params';
import type { Recipe } from '@/types/recipe';

interface OccasionHubProps {
  slug: OccasionHubSlug;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Section 4 schema distinguishes `streetFood` (its own boolean) from `occasion` (a free-form
 * tag array like "Festival"/"Wedding"/"Eid") - so "street food" and "festival" aren't the same
 * kind of field, and neither has a FilterBar control of its own. Unlike Meal-Time Hub, this
 * baseline is a *hard* constraint: it scopes which recipes exist on the page at all, and the
 * reused FilterBar (meal-time/diet/occasion) only narrows further within it - the same
 * relationship the Country page has with its own country. */
function matchesOccasionHubBaseline(recipe: Recipe, slug: OccasionHubSlug): boolean {
  if (slug === 'street-food') return recipe.streetFood;
  return recipe.occasion.some((value) => value.toLowerCase() === 'festival');
}

export default async function OccasionHub({
  slug,
  searchParams,
}: OccasionHubProps): Promise<React.ReactElement> {
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
      console.error('Failed to load occasion hub recipes', error);
      statusMessage = 'Could not load dishes for this occasion right now.';
    } else {
      throw error;
    }
  }

  const baselinePool = allRecipes.filter((recipe) => matchesOccasionHubBaseline(recipe, slug));
  const filters = parseFiltersFromSearchParams(toURLSearchParams(rawSearchParams));
  const filteredRecipes = baselinePool.filter((recipe) => matchesFilters(recipe, filters));
  const availableOccasions = [...new Set(baselinePool.flatMap((recipe) => recipe.occasion))].sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <main className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <RecipeGridSection
          breadcrumbLabel="Occasion"
          heading={OCCASION_HUB_LABELS[slug]}
          statusMessage={statusMessage}
          recipes={filteredRecipes}
          filterBarAction={`/${slug}`}
          selectedMealTimes={filters.mealTime ?? []}
          selectedDiets={filters.diet ?? []}
          availableOccasions={availableOccasions}
          selectedOccasions={filters.occasion ?? []}
        />
      </div>
    </main>
  );
}
