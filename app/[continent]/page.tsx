import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AtlasRule } from '@/components/AtlasRule';
import { CountryCard } from '@/components/CountryCard';
import { CONTINENT_LABELS, isContinentSlug } from '@/lib/constants';
import { fetchAllRecipes, GithubConfigError, GithubDataError } from '@/lib/github';
import { summarizeCountries, type CountrySummary } from '@/lib/recipe-aggregations';

interface ContinentPageProps {
  params: Promise<{ continent: string }>;
}

export async function generateMetadata({ params }: ContinentPageProps): Promise<Metadata> {
  const { continent } = await params;
  if (!isContinentSlug(continent)) return {};

  return {
    title: `${CONTINENT_LABELS[continent]} Recipes`,
    description: `Explore traditional dishes from every country in ${CONTINENT_LABELS[continent]}.`,
    alternates: { canonical: `/${continent}` },
  };
}

export default async function ContinentPage({
  params,
}: ContinentPageProps): Promise<React.ReactElement> {
  const { continent } = await params;

  if (!isContinentSlug(continent)) {
    notFound();
  }

  const { env } = getCloudflareContext();

  let countries: CountrySummary[] = [];
  let statusMessage: string | null = null;

  try {
    const recipes = await fetchAllRecipes(env);
    countries = summarizeCountries(recipes).filter((country) => country.continentSlug === continent);
  } catch (error) {
    if (error instanceof GithubConfigError) {
      statusMessage = 'This atlas is not connected to a recipe source yet.';
    } else if (error instanceof GithubDataError) {
      console.error('Failed to load continent recipes', error);
      statusMessage = 'Could not load dishes for this continent right now.';
    } else {
      throw error;
    }
  }

  return (
    <main data-region={continent} className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-1)]">
          Continent
        </p>
        <h1 className="mt-2 font-display text-5xl">{CONTINENT_LABELS[continent]}</h1>
        <div className="mt-6">
          <AtlasRule />
        </div>

        <div className="mt-10">
          {statusMessage ? (
            <p className="text-ink/60">{statusMessage}</p>
          ) : countries.length === 0 ? (
            <p className="text-ink/60">
              {`No dishes from ${CONTINENT_LABELS[continent]} yet. Check back soon.`}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country) => (
                <CountryCard key={country.countrySlug} country={country} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
