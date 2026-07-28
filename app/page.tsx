import type { Metadata } from "next";
import Link from "next/link";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { SearchBar } from "@/components/home/SearchBar";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";
import { getAllDishes, getCountries } from "@/lib/data/source";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "World Kitchen Atlas",
  description:
    "A global culinary encyclopedia organized by continent, country, and dish — with history, occasion, and traditional drink pairings for every entry.",
  path: "/",
  isHome: true,
});

export default async function HomePage(): Promise<React.JSX.Element> {
  const [countries, dishes] = await Promise.all([getCountries(), getAllDishes()]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="flex flex-col items-start gap-6">
        <AtlasPin size={96} />
        <div>
          <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
            World Kitchen Atlas
          </h1>
          <p className="mt-4 max-w-prose font-body text-lg text-ink/70">
            A global culinary encyclopedia — continent, country, and dish — with the history,
            occasion, and traditional drink pairing behind every entry.
          </p>
        </div>
        <AtlasRule className="w-full" />
        <SearchBar />
      </section>

      <section aria-labelledby="continents-heading" className="flex flex-col gap-6">
        <h2 id="continents-heading" className="font-display text-2xl text-ink">
          Explore by continent
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTINENTS.map((continent) => {
            const countryCount = countries.filter(
              (country) => country.continentSlug === continent.slug,
            ).length;
            const dishCount = dishes.filter(
              (dish) => dish.continentSlug === continent.slug,
            ).length;

            return (
              <Link
                key={continent.slug}
                href={`/${continent.slug}/`}
                data-region={continent.slug}
                className="flex flex-col gap-2 border border-clay-line bg-parchment p-5 transition-colors hover:border-ink"
              >
                <span className="h-1 w-10" style={{ backgroundColor: "var(--accent-1)" }} />
                <h3 className="font-display text-xl text-ink">{continent.name}</h3>
                <p className="font-meta text-xs text-ink/60">
                  {countryCount} {countryCount === 1 ? "country" : "countries"} · {dishCount}{" "}
                  {dishCount === 1 ? "dish" : "dishes"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="meal-times-heading" className="flex flex-col gap-4">
        <h2 id="meal-times-heading" className="font-display text-2xl text-ink">
          Browse by meal time
        </h2>
        <div className="flex flex-wrap gap-2">
          {MEAL_TIMES.map((mealTime) => (
            <Link
              key={mealTime.slug}
              href={`/${mealTime.slug}/`}
              className="border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-ink hover:text-ink"
            >
              {mealTime.name}
            </Link>
          ))}
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion.slug}
              href={`/${occasion.slug}/`}
              className="border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-ink hover:text-ink"
            >
              {occasion.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
