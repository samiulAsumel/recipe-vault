import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { fetchAllRecipes, fetchCountryRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { matchesFilters, parseFiltersFromSearchParams } from '@/lib/recipe-filters';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { env } = getCloudflareContext();
  const filters = parseFiltersFromSearchParams(request.nextUrl.searchParams);

  try {
    const recipes = filters.country
      ? await fetchCountryRecipes(filters.country, env)
      : await fetchAllRecipes(env);

    const data = recipes.filter((recipe) => matchesFilters(recipe, filters));

    return apiSuccess(data, {
      message: `${data.length} recipe(s) found`,
      pagination: { total: data.length },
    });
  } catch (error) {
    if (error instanceof GithubConfigError) {
      return apiError(500, 'MISSING_CONFIG', error.message);
    }
    if (error instanceof GithubDataError) {
      return apiError(error.statusCode, 'GITHUB_FETCH_FAILED', error.message);
    }
    return apiError(500, 'INTERNAL_ERROR', 'Unexpected error fetching recipes');
  }
}
