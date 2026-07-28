import type { ContinentSlug } from "@/lib/constants";
import type { DietaryFlags, DishEntry, MealTime, Occasion } from "@/lib/types/recipe";

export interface DishFilters {
  continentSlugs?: ContinentSlug[];
  countrySlug?: string;
  mealTime?: MealTime[];
  occasion?: Occasion[];
  dietary?: Array<keyof DietaryFlags>;
  streetFood?: boolean;
}

function matchesContinent(entry: DishEntry, continentSlugs: ContinentSlug[] | undefined): boolean {
  if (!continentSlugs || continentSlugs.length === 0) return true;
  return continentSlugs.includes(entry.continentSlug);
}

function matchesMealTime(entry: DishEntry, mealTime: MealTime[] | undefined): boolean {
  if (!mealTime || mealTime.length === 0) return true;
  return mealTime.some((meal) => entry.mealTime.includes(meal));
}

function matchesOccasion(entry: DishEntry, occasion: Occasion[] | undefined): boolean {
  if (!occasion || occasion.length === 0) return true;
  return occasion.some((tag) => entry.occasion.includes(tag));
}

function matchesDietary(entry: DishEntry, dietary: Array<keyof DietaryFlags> | undefined): boolean {
  if (!dietary || dietary.length === 0) return true;
  return dietary.every((flag) => entry.dietary[flag]);
}

/**
 * Section 6: dietary filters are AND logic; meal-time/occasion/continent are OR
 * within their own category, AND across categories (country/streetFood behave
 * as additional AND-joined criteria).
 */
export function matchesFilters(entry: DishEntry, filters: DishFilters): boolean {
  if (!matchesContinent(entry, filters.continentSlugs)) return false;
  if (filters.countrySlug && entry.countrySlug !== filters.countrySlug) return false;
  if (filters.streetFood !== undefined && entry.streetFood !== filters.streetFood) return false;
  if (!matchesMealTime(entry, filters.mealTime)) return false;
  if (!matchesOccasion(entry, filters.occasion)) return false;
  if (!matchesDietary(entry, filters.dietary)) return false;
  return true;
}

export function filterDishes(entries: DishEntry[], filters: DishFilters): DishEntry[] {
  return entries.filter((entry) => matchesFilters(entry, filters));
}

const FESTIVAL_OCCASION_TAGS = new Set(["festival", "festival food"]);

/**
 * occasion is free-form (Section 4), and the route slug "festival-food" doesn't
 * literally match the spec's own example tag "Festival" — tolerate both phrasings
 * rather than requiring exact-string discipline from every future content addition.
 */
export function isFestivalDish(entry: DishEntry): boolean {
  return entry.occasion.some((tag) => FESTIVAL_OCCASION_TAGS.has(tag.toLowerCase()));
}
