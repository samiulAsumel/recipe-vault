import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { MetadataRoute } from 'next';
import { CONTINENT_SLUGS, MEAL_TIME_SLUGS, OCCASION_HUB_SLUGS } from '@/lib/constants';
import { fetchAllRecipes } from '@/lib/github';
import { summarizeCountries } from '@/lib/recipe-aggregations';
import { SITE_URL } from '@/lib/site-config';

/** Forces per-request generation - otherwise Next tries to render this at build time, when
 * there's no live Cloudflare request context to read GitHub credentials from. */
export const dynamic = 'force-dynamic';

/** Section 7: sitemap covering every static hub plus every country/recipe page. `/search` and
 * `/admin` are deliberately excluded - both are marked `noindex` (Section 7's own
 * duplicate-content concern, and Section 11's "hidden route" respectively), and a noindex page
 * listed in the sitemap is a contradiction Search Console flags as an error. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/submit-recipe`, changeFrequency: 'yearly', priority: 0.3 },
    ...CONTINENT_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...MEAL_TIME_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...OCCASION_HUB_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  try {
    const { env } = await getCloudflareContext({ async: true });
    const recipes = await fetchAllRecipes(env);

    const countryEntries: MetadataRoute.Sitemap = summarizeCountries(recipes).map((country) => ({
      url: `${SITE_URL}/${country.continentSlug}/${country.countrySlug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const recipeEntries: MetadataRoute.Sitemap = recipes.map((recipe) => ({
      url: `${SITE_URL}/${recipe.continentSlug}/${recipe.countrySlug}/${recipe.slug}`,
      changeFrequency: 'monthly' as const,
      priority: recipe.fullRecipeAvailable ? 0.8 : 0.5,
    }));

    return [...staticEntries, ...countryEntries, ...recipeEntries];
  } catch (error) {
    console.error('Failed to include recipes in sitemap', error);
    return staticEntries;
  }
}
