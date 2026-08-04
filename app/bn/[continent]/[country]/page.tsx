import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { PairedDrinkList } from "@/components/dish/PairedDrinkList";
import { FilteredDishes } from "@/components/filters/FilteredDishes";
import { CONTINENTS, EMPTY_STATIC_PARAM, isContinentSlug } from "@/lib/constants";
import { getAllDishes, getCountriesByContinent, getDishesByCountry } from "@/lib/data/source";
import { bn as dict } from "@/lib/i18n/dictionaries/bn";
import { localizeContinentName, localizeCountryName } from "@/lib/i18n/labels";
import { buildPageMetadata } from "@/lib/seo";

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
  const params = perContinent.flat();
  return params.length > 0
    ? params
    : [{ continent: CONTINENTS[0].slug, country: EMPTY_STATIC_PARAM }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ continent: string; country: string }>;
}): Promise<Metadata> {
  const { continent, country } = await params;
  const dishes = await getDishesByCountry(country);
  const name = localizeCountryName(dishes[0]?.country ?? country, "bn");
  return buildPageMetadata({
    title: name,
    description: dict.country.metaDescription(dishes.length, name),
    path: `/bn/${continent}/${country}/`,
  });
}

export default async function CountryPageBn({
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
  const pairedDrinks = [...new Set(dishes.flatMap((dish) => dish.pairedDrink))];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <Link
          href={`/bn/${continent}/`}
          className="font-meta text-xs uppercase tracking-wide text-ink/50 hover:text-turmeric"
        >
          {localizeContinentName(continentMeta?.name ?? continent, "bn")}
        </Link>
        <h1 className="font-display text-5xl text-ink">
          {localizeCountryName(dishes[0].country, "bn")}
        </h1>
        <AtlasRule />
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <FilteredDishes dishes={dishes} emptyMessage={dict.country.emptyMessage} />
      </Suspense>

      {pairedDrinks.length > 0 && (
        <section
          aria-labelledby="drinks-heading"
          className="flex flex-col gap-4 border-t border-clay-line pt-8"
        >
          <h2 id="drinks-heading" className="font-display text-2xl text-ink">
            {dict.country.traditionalDrinks}
          </h2>
          {/* Aggregated across every dish in the country — no single dish's
              translations.bn.pairedDrink applies to this union, so drink
              names here stay English until per-drink-entry translation
              exists as its own dish page. */}
          <PairedDrinkList drinks={pairedDrinks} allDishes={allDishes} locale="bn" />
        </section>
      )}
    </main>
  );
}
