import type { Metadata } from "next";
import Link from "next/link";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { SearchBar } from "@/components/home/SearchBar";
import { bn as dict } from "@/lib/i18n/dictionaries/bn";
import { localizeContinentName, MEAL_TIME_LABELS, localizeOccasionName } from "@/lib/i18n/labels";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";
import { getAllDishes, getCountries } from "@/lib/data/source";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: dict.home.title,
  description: dict.site.description,
  path: "/bn/",
  isHome: true,
});

export default async function HomePageBn(): Promise<React.JSX.Element> {
  const [countries, dishes] = await Promise.all([getCountries(), getAllDishes()]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
      <section className="flex flex-col items-start gap-6">
        <AtlasPin size={96} />
        <div>
          <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
            {dict.home.title}
          </h1>
          <p className="mt-4 max-w-prose font-body text-lg text-ink/70">{dict.home.heroParagraph}</p>
        </div>
        <AtlasRule className="w-full" />
        <SearchBar />
      </section>

      <section aria-labelledby="continents-heading" className="flex flex-col gap-6">
        <h2 id="continents-heading" className="font-display text-2xl text-ink">
          {dict.home.exploreByContinent}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTINENTS.filter(
            (continent) => dishes.filter((dish) => dish.continentSlug === continent.slug).length > 0,
          ).map((continent) => {
            const countryCount = countries.filter(
              (country) => country.continentSlug === continent.slug,
            ).length;
            const dishCount = dishes.filter((dish) => dish.continentSlug === continent.slug).length;

            return (
              <Link
                key={continent.slug}
                href={`/bn/${continent.slug}/`}
                data-region={continent.slug}
                className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-clay-line bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-turmeric hover:shadow-[var(--shadow-lift)]"
              >
                <span className="h-1 w-10" style={{ backgroundColor: "var(--accent-1)" }} />
                <h3 className="font-display text-xl text-ink">
                  {localizeContinentName(continent.name, "bn")}
                </h3>
                <p className="font-meta text-xs text-ink/60">
                  {countryCount} {dict.home.countryCount(countryCount)} · {dishCount}{" "}
                  {dict.home.dishCount(dishCount)}
                </p>
              </Link>
            );
          })}
        </div>
        {(() => {
          const comingSoon = CONTINENTS.filter(
            (continent) =>
              dishes.filter((dish) => dish.continentSlug === continent.slug).length === 0,
          );
          if (comingSoon.length === 0) return null;
          return (
            <p className="font-meta text-xs uppercase tracking-wide text-ink/40">
              {dict.home.comingSoonLabel}:{" "}
              {comingSoon.map((continent) => localizeContinentName(continent.name, "bn")).join(", ")}
            </p>
          );
        })()}
      </section>

      <section aria-labelledby="meal-times-heading" className="flex flex-col gap-4">
        <h2 id="meal-times-heading" className="font-display text-2xl text-ink">
          {dict.home.browseByMealTime}
        </h2>
        <div className="flex flex-wrap gap-2">
          {MEAL_TIMES.map((mealTime) => (
            <Link
              key={mealTime.slug}
              href={`/bn/${mealTime.slug}/`}
              className="rounded-[5px] border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-turmeric hover:text-ink"
            >
              {MEAL_TIME_LABELS.bn[mealTime.name]}
            </Link>
          ))}
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion.slug}
              href={`/bn/${occasion.slug}/`}
              className="rounded-[5px] border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-turmeric hover:text-ink"
            >
              {localizeOccasionName(occasion.name, "bn")}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
