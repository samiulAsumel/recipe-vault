import type { Recipe } from '@/types/recipe';

export interface CountrySummary {
  country: string;
  countrySlug: string;
  continentSlug: string;
  dishCount: number;
}

/** Groups recipes by country (Section 5 Continent Hub: "name + dish count + flag-color sliver"). */
export function summarizeCountries(recipes: Recipe[]): CountrySummary[] {
  const byCountrySlug = new Map<string, CountrySummary>();

  for (const recipe of recipes) {
    const existing = byCountrySlug.get(recipe.countrySlug);
    if (existing) {
      existing.dishCount += 1;
    } else {
      byCountrySlug.set(recipe.countrySlug, {
        country: recipe.country,
        countrySlug: recipe.countrySlug,
        continentSlug: recipe.continentSlug,
        dishCount: 1,
      });
    }
  }

  return [...byCountrySlug.values()].sort((a, b) => a.country.localeCompare(b.country));
}

/** Unique paired-drink names across a set of recipes, for the Country page's
 * "Traditional Drinks" strip (Section 5). */
export function collectPairedDrinks(recipes: Recipe[]): string[] {
  const drinks = new Set<string>();
  for (const recipe of recipes) {
    for (const drink of recipe.pairedDrink) {
      drinks.add(drink);
    }
  }
  return [...drinks].sort((a, b) => a.localeCompare(b));
}
