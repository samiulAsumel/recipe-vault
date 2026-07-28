import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { FilteredDishes } from "@/components/filters/FilteredDishes";
import { CONTINENTS, isContinentSlug } from "@/lib/constants";
import { getAllDishes, getCountriesByContinent, getDishesByCountry } from "@/lib/data/source";

export const dynamicParams = false;

// Each level returns the FULL ancestor path, not just its own segment — Next.js
// (vercel/next.js#55574) doesn't reliably merge per-segment generateStaticParams
// across 3+ nested dynamic route levels under output: 'export'.
export async function generateStaticParams(): Promise<Array<{ continent: string; country: string }>> {
  const perContinent = await Promise.all(
    CONTINENTS.map(async (continent) => {
      const countries = await getCountriesByContinent(continent.slug);
      return countries.map((country) => ({ continent: continent.slug, country: country.slug }));
    }),
  );
  return perContinent.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ continent: string; country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const dishes = await getDishesByCountry(country);
  const name = dishes[0]?.country ?? country;
  return {
    title: name,
    description: `${dishes.length} dish ${dishes.length === 1 ? "entry" : "entries"} from ${name} — history, occasion, and traditional drink pairings.`,
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ continent: string; country: string }>;
}): Promise<React.JSX.Element> {
  const { continent, country } = await params;
  if (!isContinentSlug(continent)) {
    notFound();
  }

  const [dishes, allDishes] = await Promise.all([getDishesByCountry(country), getAllDishes()]);
  if (dishes.length === 0) {
    notFound();
  }

  const continentMeta = CONTINENTS.find((c) => c.slug === continent);
  const dishByName = new Map(allDishes.map((dish) => [dish.name.toLowerCase(), dish]));
  const pairedDrinks = [...new Set(dishes.flatMap((dish) => dish.pairedDrink))];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link
          href={`/${continent}/`}
          className="font-meta text-xs uppercase tracking-wide text-ink/50 hover:text-turmeric"
        >
          {continentMeta?.name ?? continent}
        </Link>
        <h1 className="font-display text-5xl text-ink">{dishes[0].country}</h1>
        <AtlasRule />
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <FilteredDishes dishes={dishes} emptyMessage="No dishes match these filters." />
      </Suspense>

      {pairedDrinks.length > 0 && (
        <section
          aria-labelledby="drinks-heading"
          className="flex flex-col gap-4 border-t border-clay-line pt-8"
        >
          <h2 id="drinks-heading" className="font-display text-2xl text-ink">
            Traditional Drinks
          </h2>
          <ul className="flex flex-wrap gap-2">
            {pairedDrinks.map((drink) => {
              const drinkDish = dishByName.get(drink.toLowerCase());
              return (
                <li key={drink}>
                  {drinkDish ? (
                    <Link
                      href={`/${drinkDish.continentSlug}/${drinkDish.countrySlug}/${drinkDish.slug}/`}
                      className="border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-ink hover:text-ink"
                    >
                      {drink}
                    </Link>
                  ) : (
                    <span className="border border-dashed border-clay-line px-4 py-2 font-body text-sm text-ink/60">
                      {drink}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
