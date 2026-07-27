import { DIETARY_KEYS, type DietaryKey } from '@/lib/constants';
import type { Recipe } from '@/types/recipe';

export interface RecipeFilters {
  continent?: string[];
  country?: string;
  slug?: string;
  mealTime?: string[];
  occasion?: string[];
  diet?: DietaryKey[];
  streetFood?: boolean;
  difficulty?: string;
  fullRecipeAvailable?: boolean;
}

/** Reads both repeated-key (`?diet=a&diet=b`, what a plain HTML checkbox form submits)
 * and comma-separated (`?diet=a,b`, what the API/search-bar links use) query params. */
function parseCsv(searchParams: URLSearchParams, key: string): string[] | undefined {
  const items = searchParams
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function parseBoolean(searchParams: URLSearchParams, key: string): boolean | undefined {
  const value = searchParams.get(key);
  return value === null ? undefined : value === 'true';
}

function parseDiet(searchParams: URLSearchParams): DietaryKey[] | undefined {
  const requested = parseCsv(searchParams, 'diet');
  if (!requested) return undefined;
  const known = new Set<string>(DIETARY_KEYS);
  const valid = requested.filter((key): key is DietaryKey => known.has(key));
  return valid.length > 0 ? valid : undefined;
}

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): RecipeFilters {
  return {
    continent: parseCsv(searchParams, 'continent')?.map((value) => value.toLowerCase()),
    country: searchParams.get('country')?.toLowerCase() ?? undefined,
    slug: searchParams.get('slug')?.toLowerCase() ?? undefined,
    mealTime: parseCsv(searchParams, 'mealTime'),
    occasion: parseCsv(searchParams, 'occasion'),
    diet: parseDiet(searchParams),
    streetFood: parseBoolean(searchParams, 'streetFood'),
    difficulty: searchParams.get('difficulty') ?? undefined,
    fullRecipeAvailable: parseBoolean(searchParams, 'fullRecipeAvailable'),
  };
}

/** Section 6: dietary filters are AND; meal-time/occasion/continent are OR within their own
 * category, AND against every other category. */
export function matchesFilters(recipe: Recipe, filters: RecipeFilters): boolean {
  if (filters.continent) {
    const wanted = new Set(filters.continent.map((value) => value.toLowerCase()));
    if (!wanted.has(recipe.continentSlug.toLowerCase())) return false;
  }
  if (filters.country && recipe.countrySlug !== filters.country) return false;
  if (filters.slug && recipe.slug !== filters.slug) return false;
  if (filters.streetFood !== undefined && recipe.streetFood !== filters.streetFood) return false;
  if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
  if (
    filters.fullRecipeAvailable !== undefined &&
    recipe.fullRecipeAvailable !== filters.fullRecipeAvailable
  ) {
    return false;
  }

  if (filters.mealTime) {
    const wanted = new Set(filters.mealTime.map((value) => value.toLowerCase()));
    if (!recipe.mealTime.some((value) => wanted.has(value.toLowerCase()))) return false;
  }

  if (filters.occasion) {
    const wanted = new Set(filters.occasion.map((value) => value.toLowerCase()));
    if (!recipe.occasion.some((value) => wanted.has(value.toLowerCase()))) return false;
  }

  if (filters.diet && !filters.diet.every((key) => recipe.dietary[key])) {
    return false;
  }

  return true;
}
