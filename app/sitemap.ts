import type { MetadataRoute } from "next";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";
import { getAllDishes, getCountries } from "@/lib/data/source";
import { getSiteUrl } from "@/lib/env";

const STATIC_PATHS = ["/", "/search/", "/about/", "/submit-recipe/"];

export const dynamic = "force-static";

/** Every path exists in both locales — English unprefixed, Bengali under
 * /bn/ (see app/bn/...). Each entry links to its counterpart via
 * alternates.languages so search engines see them as translations of the
 * same page (hreflang), not unrelated URLs. */
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

  return paths.flatMap((path) => {
    const bnPath = path === "/" ? "/bn/" : `/bn${path}`;
    const alternates = { languages: { en: `${siteUrl}${path}`, bn: `${siteUrl}${bnPath}` } };
    return [
      { url: `${siteUrl}${path}`, alternates },
      { url: `${siteUrl}${bnPath}`, alternates },
    ];
  });
}
