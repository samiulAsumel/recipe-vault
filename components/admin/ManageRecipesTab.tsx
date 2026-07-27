import { getCloudflareContext } from '@opennextjs/cloudflare';
import Link from 'next/link';
import { DishForm } from '@/components/admin/DishForm';
import { fetchAllRecipes, fetchCountryRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { summarizeCountries } from '@/lib/recipe-aggregations';
import type { Recipe } from '@/types/recipe';

interface ManageRecipesTabProps {
  country?: string;
  dish?: string;
}

const linkClass = 'text-xs text-ink/60 hover:underline';
const primaryButtonClass =
  'border border-ink bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-parchment transition-colors hover:border-turmeric hover:bg-turmeric';

interface LoadResult {
  statusMessage: string | null;
  initialRecipe: Recipe | null;
  countryDishes: Recipe[];
  countries: ReturnType<typeof summarizeCountries>;
}

async function loadData(env: CloudflareEnv, country?: string, dish?: string): Promise<LoadResult> {
  try {
    if (dish && dish !== '__new__' && country) {
      const countryRecipes = await fetchCountryRecipes(country, env);
      return {
        statusMessage: null,
        initialRecipe: countryRecipes.find((recipe) => recipe.slug === dish) ?? null,
        countryDishes: [],
        countries: [],
      };
    }

    if (country) {
      const countryDishes = await fetchCountryRecipes(country, env);
      return { statusMessage: null, initialRecipe: null, countryDishes, countries: [] };
    }

    const countries = summarizeCountries(await fetchAllRecipes(env));
    return { statusMessage: null, initialRecipe: null, countryDishes: [], countries };
  } catch (error) {
    if (error instanceof GithubConfigError) {
      return {
        statusMessage: 'This atlas is not connected to a recipe source yet.',
        initialRecipe: null,
        countryDishes: [],
        countries: [],
      };
    }
    if (error instanceof GithubDataError) {
      console.error('Failed to load Manage Recipes tab', error);
      return {
        statusMessage: 'Could not load the recipe index right now.',
        initialRecipe: null,
        countryDishes: [],
        countries: [],
      };
    }
    throw error;
  }
}

/** Section 12 "Manage Recipes" tab. URL-driven, same pattern as the rest of the site:
 * ?tab=recipes -> country list; ?country=X -> that country's dishes; ?dish=Y (with country) ->
 * edit; ?dish=__new__ (country optional) -> a blank add form. */
export async function ManageRecipesTab({ country, dish }: ManageRecipesTabProps): Promise<React.ReactElement> {
  const { env } = getCloudflareContext();
  const { statusMessage, initialRecipe, countryDishes, countries } = await loadData(env, country, dish);

  if (statusMessage) {
    return <p className="text-ink/60">{statusMessage}</p>;
  }

  if (dish) {
    return (
      <div>
        <Link href={country ? `/admin?tab=recipes&country=${country}` : '/admin?tab=recipes'} className={linkClass}>
          ← Back
        </Link>
        <h2 className="mt-3 font-display text-2xl">
          {dish === '__new__' ? 'Add a new dish' : `Edit ${initialRecipe?.name ?? dish}`}
        </h2>
        <div className="mt-6">
          <DishForm initialRecipe={initialRecipe} previousCountrySlug={country} />
        </div>
      </div>
    );
  }

  if (country) {
    return (
      <div>
        <Link href="/admin?tab=recipes" className={linkClass}>
          ← All countries
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">{countryDishes[0]?.country ?? country}</h2>
          <Link href={`/admin?tab=recipes&country=${country}&dish=__new__`} className={primaryButtonClass}>
            + Add new dish
          </Link>
        </div>

        <ul className="mt-6 flex flex-col gap-2">
          {countryDishes.map((recipe) => (
            <li key={recipe.slug} className="flex items-center justify-between border border-clay-line px-4 py-2">
              <span className="text-sm text-ink">{recipe.name}</span>
              <span className="flex items-center gap-3">
                <span
                  className={`font-mono text-xs ${
                    recipe.fullRecipeAvailable ? 'text-cardamom' : 'text-ink/40'
                  }`}
                >
                  {recipe.fullRecipeAvailable ? 'Full recipe' : 'Discovery only'}
                </span>
                <Link
                  href={`/admin?tab=recipes&country=${country}&dish=${recipe.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-ink hover:text-turmeric"
                >
                  Edit
                </Link>
              </span>
            </li>
          ))}
          {countryDishes.length === 0 ? <p className="text-sm text-ink/50">No dishes in this country yet.</p> : null}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Countries</h2>
        <Link href="/admin?tab=recipes&dish=__new__" className={primaryButtonClass}>
          + Add a new country
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {countries.map((entry) => (
          <li key={entry.countrySlug}>
            <Link
              href={`/admin?tab=recipes&country=${entry.countrySlug}`}
              className="flex items-center justify-between border border-clay-line px-4 py-3 hover:border-turmeric"
            >
              <span className="text-sm text-ink">{entry.country}</span>
              <span className="font-mono text-xs text-ink/50">{entry.dishCount} dishes</span>
            </Link>
          </li>
        ))}
        {countries.length === 0 ? <p className="text-sm text-ink/50">No countries yet.</p> : null}
      </ul>
    </div>
  );
}
