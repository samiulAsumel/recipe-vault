import type { Metadata } from 'next';
import Link from 'next/link';
import { AtlasPin } from '@/components/AtlasPin';
import {
  CONTINENT_LABELS,
  CONTINENT_SLUGS,
  MEAL_TIME_LABELS,
  MEAL_TIME_SLUGS,
} from '@/lib/constants';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
        <AtlasPin confidenceLevel="high" size="lg" />
        <h1 className="font-display text-5xl">World Kitchen Atlas</h1>
        <p className="max-w-xl text-ink/70">
          {
            'A field-researcher’s culinary atlas: continent, country, and dish, each entry with its history, occasion, and traditional drink pairing.'
          }
        </p>
        <form action="/search" method="GET" role="search" className="flex w-full max-w-md gap-2">
          <label htmlFor="home-search" className="sr-only">
            Search dishes
          </label>
          <input
            id="home-search"
            type="search"
            name="q"
            placeholder="Search a dish, country, or ingredient"
            className="w-full border border-clay-line bg-parchment px-4 py-2 text-ink placeholder:text-ink/40 focus-visible:border-turmeric"
          />
          <button
            type="submit"
            className="shrink-0 border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-parchment transition-colors hover:border-turmeric hover:bg-turmeric"
          >
            Search
          </button>
        </form>
      </section>

      <section aria-labelledby="continents-heading" className="mx-auto max-w-5xl px-6 pb-16">
        <h2 id="continents-heading" className="font-display text-2xl">
          Explore by continent
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CONTINENT_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={`/${slug}`}
              data-region={slug}
              className="flex items-center gap-3 border border-clay-line p-4 transition-colors hover:border-[var(--accent-1)]"
            >
              <span className="h-8 w-1.5 shrink-0 bg-[var(--accent-1)]" aria-hidden="true" />
              <span className="font-display text-lg">{CONTINENT_LABELS[slug]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="meal-times-heading" className="mx-auto max-w-5xl px-6 pb-24">
        <h2 id="meal-times-heading" className="font-display text-2xl">
          Browse by meal time
        </h2>
        <nav aria-label="Meal times" className="mt-6 flex flex-wrap gap-3">
          {MEAL_TIME_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="border border-clay-line px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:border-turmeric"
            >
              {MEAL_TIME_LABELS[slug]}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
