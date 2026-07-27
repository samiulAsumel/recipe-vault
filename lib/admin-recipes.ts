import { fetchCountryRecipes, GithubDataError, writeCountryRecipes } from '@/lib/github';
import type { Recipe } from '@/types/recipe';

async function readCountryFileOrEmpty(countrySlug: string, env: CloudflareEnv): Promise<Recipe[]> {
  try {
    return await fetchCountryRecipes(countrySlug, env);
  } catch (error) {
    if (error instanceof GithubDataError && error.statusCode === 404) return [];
    throw error;
  }
}

/** Section 12 "Manage Recipes" / Section 13 workflow: add-or-replace a dish by slug within its
 * country's file. `previousCountrySlug` covers the edge case where the admin changes a dish's
 * country mid-edit - the entry is removed from the old file and written into the new one,
 * rather than silently duplicating it. */
export async function upsertDish(
  env: CloudflareEnv,
  recipe: Recipe,
  previousCountrySlug?: string,
): Promise<void> {
  const isMovingCountry = previousCountrySlug && previousCountrySlug !== recipe.countrySlug;

  if (isMovingCountry) {
    const oldCountryRecipes = await readCountryFileOrEmpty(previousCountrySlug, env);
    const withoutMovedDish = oldCountryRecipes.filter((existing) => existing.slug !== recipe.slug);
    await writeCountryRecipes(
      previousCountrySlug,
      withoutMovedDish,
      env,
      `Move ${recipe.name} out of ${previousCountrySlug}`,
    );
  }

  const countryRecipes = await readCountryFileOrEmpty(recipe.countrySlug, env);
  const existingIndex = countryRecipes.findIndex((existing) => existing.slug === recipe.slug);
  const isNew = existingIndex < 0;

  const updated = isNew
    ? [...countryRecipes, recipe]
    : countryRecipes.map((existing, index) => (index === existingIndex ? recipe : existing));

  await writeCountryRecipes(
    recipe.countrySlug,
    updated,
    env,
    `${isNew ? 'Add' : 'Update'} ${recipe.name} (${recipe.countrySlug})`,
  );
}
