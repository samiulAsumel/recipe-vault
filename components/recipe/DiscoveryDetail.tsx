import Link from "next/link";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { PairedDrinkList } from "@/components/dish/PairedDrinkList";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizeContinentName, localizeCountryName } from "@/lib/i18n/labels";
import type { DishEntry } from "@/lib/types/recipe";

interface DiscoveryDetailProps {
  dish: DishEntry;
  allDishes: DishEntry[];
  locale?: Locale;
}

export function DiscoveryDetail({
  dish,
  allDishes,
  locale = "en",
}: DiscoveryDetailProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const hasOccasion = dish.streetFood || dish.occasion.length > 0;
  const bn = locale === "bn" ? dish.translations?.bn : undefined;
  const prefix = locale === "bn" ? "/bn" : "";
  const name = bn?.name ?? dish.name;
  const shortDescription = bn?.shortDescription ?? dish.shortDescription;
  const historicNote = bn?.historicNote ?? dish.historicNote;
  const whenEaten = bn?.whenEaten ?? dish.whenEaten;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 font-meta text-xs uppercase tracking-wide text-ink/50">
          <Link href={`${prefix}/${dish.continentSlug}/`} className="hover:text-turmeric">
            {localizeContinentName(dish.continent, locale)}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`${prefix}/${dish.continentSlug}/${dish.countrySlug}/`}
            className="hover:text-turmeric"
          >
            {localizeCountryName(dish.country, locale)}
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl text-ink">{name}</h1>
          <AtlasPin
            confidenceLevel={dish.confidenceLevel}
            hasOccasion={hasOccasion}
            size={32}
            locale={locale}
          />
        </div>
        <AtlasRule />
      </header>

      <p className="font-body text-base text-ink/80">{shortDescription}</p>

      <dl className="flex flex-col gap-4 border-t border-clay-line pt-6">
        <div>
          <dt className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {dict.discoveryDetail.history}
          </dt>
          <dd className="mt-1 font-body text-sm text-ink/80">{historicNote}</dd>
        </div>
        <div>
          <dt className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {dict.discoveryDetail.whenEaten}
          </dt>
          <dd className="mt-1 font-body text-sm text-ink/80">{whenEaten}</dd>
        </div>
      </dl>

      {dish.pairedDrink.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-clay-line pt-6">
          <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {dict.discoveryDetail.pairedDrink}
          </h2>
          <PairedDrinkList
            drinks={dish.pairedDrink}
            translatedDrinks={bn?.pairedDrink}
            allDishes={allDishes}
            locale={locale}
          />
        </div>
      )}

      <p className="rounded-[var(--radius-card)] border border-dashed border-clay-line p-8 text-center font-body text-sm text-ink/60">
        {dict.discoveryDetail.comingSoon}
      </p>
    </main>
  );
}
