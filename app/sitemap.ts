import type { MetadataRoute } from "next";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";
import { getAllDishes, getCountries } from "@/lib/data/source";
import { getSiteUrl } from "@/lib/env";

const STATIC_PATHS = ["/", "/search/", "/about/", "/submit-recipe/"];

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  // No production domain chosen yet — a sitemap entry must be absolute to be
  // valid, so there's no relative fallback the way there is for canonical tags.
  if (!siteUrl) return [];

  const [dishes, countries] = await Promise.all([getAllDishes(), getCountries()]);

  const paths = [
    ...STATIC_PATHS,
    ...CONTINENTS.map((continent) => `/${continent.slug}/`),
    ...MEAL_TIMES.map((mealTime) => `/${mealTime.slug}/`),
    ...OCCASIONS.map((occasion) => `/${occasion.slug}/`),
    ...countries.map((country) => `/${country.continentSlug}/${country.slug}/`),
    ...dishes.map((dish) => `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`),
  ];

  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
