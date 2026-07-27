import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DiscoveryRecipeView } from '@/components/recipe-detail/DiscoveryRecipeView';
import { FullRecipeView } from '@/components/recipe-detail/FullRecipeView';
import { isContinentSlug } from '@/lib/constants';
import { fetchCountryRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { buildRecipeJsonLd } from '@/lib/recipe-json-ld';
import type { Recipe } from '@/types/recipe';

interface DishPageProps {
  params: Promise<{ continent: string; country: string; dish: string }>;
}

function UnavailableNotice({ message }: { message: string }): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-6 text-ink">
      <p className="max-w-md text-center text-ink/60">{message}</p>
    </main>
  );
}

/** Best-effort lookup for generateMetadata - unlike the page body, metadata generation doesn't
 * need to distinguish *why* the recipe couldn't be loaded, just whether it can render anything. */
async function tryFindRecipe(
  country: string,
  dish: string,
  env: CloudflareEnv,
): Promise<Recipe | undefined> {
  try {
    const recipes = await fetchCountryRecipes(country, env);
    return recipes.find((item) => item.slug === dish);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const { continent, country, dish } = await params;
  if (!isContinentSlug(continent)) return {};

  const { env } = getCloudflareContext();
  const recipe = await tryFindRecipe(country, dish, env);
  if (!recipe) return {};

  const path = `/${recipe.continentSlug}/${recipe.countrySlug}/${recipe.slug}`;

  return {
    title: `${recipe.name} — ${recipe.country}`,
    description: recipe.shortDescription,
    alternates: { canonical: path },
    openGraph: {
      title: recipe.name,
      description: recipe.shortDescription,
      url: path,
      images: [{ url: recipe.heroImage }],
      type: 'article',
    },
  };
}

export default async function DishPage({ params }: DishPageProps): Promise<React.ReactElement> {
  const { continent, country, dish } = await params;

  if (!isContinentSlug(continent)) {
    notFound();
  }

  const { env } = getCloudflareContext();

  const recipes = await fetchCountryRecipes(country, env).catch((error: unknown) => {
    if (error instanceof GithubDataError && error.statusCode === 404) {
      notFound();
    }
    if (error instanceof GithubConfigError) {
      return { unavailable: 'This atlas is not connected to a recipe source yet.' } as const;
    }
    if (error instanceof GithubDataError) {
      console.error('Failed to load dish', error);
      return { unavailable: 'Could not load this dish right now.' } as const;
    }
    throw error;
  });

  if ('unavailable' in recipes) {
    return <UnavailableNotice message={recipes.unavailable} />;
  }

  const recipe = recipes.find((item) => item.slug === dish);
  if (!recipe) {
    notFound();
  }

  if (!recipe.fullRecipeAvailable) {
    return <DiscoveryRecipeView recipe={recipe} />;
  }

  const jsonLd = buildRecipeJsonLd(recipe);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FullRecipeView recipe={recipe} />
    </>
  );
}
