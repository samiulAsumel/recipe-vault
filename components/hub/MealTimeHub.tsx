import { getCloudflareContext } from '@opennextjs/cloudflare';
import { RecipeGridSection } from '@/components/RecipeGridSection';
import { MEAL_TIME_LABELS, type MealTimeSlug } from '@/lib/constants';
import { fetchAllRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { matchesFilters, parseFiltersFromSearchParams } from '@/lib/recipe-filters';
import { toURLSearchParams } from '@/lib/search-params';
import type { Recipe } from '@/types/recipe';

interface MealTimeHubProps {
  slug: MealTimeSlug;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Section 9 Phase 5: reuses the Country page's card-grid + filter bar, cross-country. Unlike
 * Occasion Hub, the hub's own meal time is a *soft default* - it seeds the FilterBar's mealTime
 * checkbox so the page opens scoped to itself, but it lives in the same query param the
 * FilterBar controls, so a visitor can widen (check "Lunch" too) or leave entirely via the URL,
 * per Section 6's "combinable filters via query string". */
export default async function MealTimeHub({
  slug,
  searchParams,
}: MealTimeHubProps): Promise<React.ReactElement> {
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
      console.error('Failed to load meal-time hub recipes', error);
      statusMessage = 'Could not load dishes for this meal time right now.';
    } else {
      throw error;
    }
  }

  const params = toURLSearchParams(rawSearchParams);
  if (!params.has('mealTime')) {
    params.set('mealTime', slug);
  }
  const filters = parseFiltersFromSearchParams(params);
  const filteredRecipes = allRecipes.filter((recipe) => matchesFilters(recipe, filters));

  const mealTimePool = allRecipes.filter((recipe) =>
    recipe.mealTime.some((value) => value.toLowerCase() === slug),
  );
  const availableOccasions = [...new Set(mealTimePool.flatMap((recipe) => recipe.occasion))].sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <main className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <RecipeGridSection
          breadcrumbLabel="Meal time"
          heading={MEAL_TIME_LABELS[slug]}
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
