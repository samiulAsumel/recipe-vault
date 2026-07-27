import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeGridSection } from '@/components/RecipeGridSection';
import { isContinentSlug } from '@/lib/constants';
import { fetchCountryRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { collectPairedDrinks } from '@/lib/recipe-aggregations';
import { matchesFilters, parseFiltersFromSearchParams } from '@/lib/recipe-filters';
import { toURLSearchParams } from '@/lib/search-params';
import type { Recipe } from '@/types/recipe';

interface CountryPageProps {
  params: Promise<{ continent: string; country: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { continent, country } = await params;
  if (!isContinentSlug(continent)) return {};

  const { env } = getCloudflareContext();
  const path = `/${continent}/${country}`;

  try {
    const recipes = await fetchCountryRecipes(country, env);
    const countryLabel = recipes[0]?.country ?? country;
    return {
      title: `${countryLabel} Recipes`,
      description: `Discover traditional dishes from ${countryLabel}, with history, occasion, and traditional drink pairings.`,
      alternates: { canonical: path },
    };
  } catch {
    return { alternates: { canonical: path } };
  }
}

export default async function CountryPage({
  params,
  searchParams,
}: CountryPageProps): Promise<React.ReactElement> {
  const { continent, country } = await params;
  const rawSearchParams = await searchParams;

  if (!isContinentSlug(continent)) {
    notFound();
  }

  const { env } = getCloudflareContext();

  let allRecipes: Recipe[] = [];
  let statusMessage: string | null = null;

  try {
    allRecipes = await fetchCountryRecipes(country, env);
  } catch (error) {
    if (error instanceof GithubDataError && error.statusCode === 404) {
      notFound();
    }
    if (error instanceof GithubConfigError) {
      statusMessage = 'This atlas is not connected to a recipe source yet.';
    } else if (error instanceof GithubDataError) {
      console.error('Failed to load country recipes', error);
      statusMessage = 'Could not load dishes for this country right now.';
    } else {
      throw error;
    }
  }

  const countryLabel = allRecipes[0]?.country ?? country;
  const filters = parseFiltersFromSearchParams(toURLSearchParams(rawSearchParams));
  const filteredRecipes = allRecipes.filter((recipe) => matchesFilters(recipe, filters));
  const availableOccasions = [...new Set(allRecipes.flatMap((recipe) => recipe.occasion))].sort(
    (a, b) => a.localeCompare(b),
  );
  const pairedDrinks = collectPairedDrinks(allRecipes);

  return (
    <main data-region={continent} className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <RecipeGridSection
          breadcrumbLabel={continent}
          heading={countryLabel}
          statusMessage={statusMessage}
          recipes={filteredRecipes}
          filterBarAction={`/${continent}/${country}`}
          selectedMealTimes={filters.mealTime ?? []}
          selectedDiets={filters.diet ?? []}
          availableOccasions={availableOccasions}
          selectedOccasions={filters.occasion ?? []}
        />

        {!statusMessage && pairedDrinks.length > 0 && (
          <div className="mt-16 border-t border-clay-line pt-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">
              Traditional Drinks
            </h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {pairedDrinks.map((drink) => (
                <li key={drink} className="border border-clay-line px-3 py-1 font-mono text-xs text-ink">
                  {drink}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
