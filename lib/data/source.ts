import { getDataApiUrl } from "@/lib/env";
import type { ContinentSlug } from "@/lib/constants";
import type { CountrySummary, DishEntry } from "@/lib/types/recipe";

export class DataSourceError extends Error {
  constructor(endpoint: string, status: number) {
    super(`Data API request to ${endpoint} failed with status ${status}`);
    this.name = "DataSourceError";
  }
}

// Memoised so a single `next build` hits the Worker's /dishes endpoint once,
// not once per generateStaticParams call across continent/country/dish routes.
let dishesPromise: Promise<DishEntry[]> | null = null;

async function fetchAllDishes(): Promise<DishEntry[]> {
  const endpoint = `${getDataApiUrl()}/dishes`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new DataSourceError(endpoint, res.status);
  }
  return (await res.json()) as DishEntry[];
}

export function getAllDishes(): Promise<DishEntry[]> {
  if (!dishesPromise) {
    dishesPromise = fetchAllDishes();
  }
  return dishesPromise;
}

export async function getCountries(): Promise<CountrySummary[]> {
  const dishes = await getAllDishes();
  const bySlug = new Map<string, CountrySummary>();

  for (const dish of dishes) {
    const existing = bySlug.get(dish.countrySlug);
    if (existing) {
      existing.dishCount += 1;
    } else {
      bySlug.set(dish.countrySlug, {
        slug: dish.countrySlug,
        name: dish.country,
        continentSlug: dish.continentSlug,
        dishCount: 1,
      });
    }
  }

  return [...bySlug.values()];
}

export async function getCountriesByContinent(
  continentSlug: ContinentSlug,
): Promise<CountrySummary[]> {
  const countries = await getCountries();
  return countries.filter((country) => country.continentSlug === continentSlug);
}

export async function getDishesByCountry(countrySlug: string): Promise<DishEntry[]> {
  const dishes = await getAllDishes();
  return dishes.filter((dish) => dish.countrySlug === countrySlug);
}

export async function getDish(
  countrySlug: string,
  dishSlug: string,
): Promise<DishEntry | undefined> {
  const dishes = await getDishesByCountry(countrySlug);
  return dishes.find((dish) => dish.slug === dishSlug);
}
