import Link from "next/link";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { PairedDrinkList } from "@/components/dish/PairedDrinkList";
import type { DishEntry } from "@/lib/types/recipe";

interface DiscoveryDetailProps {
  dish: DishEntry;
  allDishes: DishEntry[];
}

export function DiscoveryDetail({ dish, allDishes }: DiscoveryDetailProps): React.JSX.Element {
  const hasOccasion = dish.streetFood || dish.occasion.length > 0;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 font-meta text-xs uppercase tracking-wide text-ink/50">
          <Link href={`/${dish.continentSlug}/`} className="hover:text-turmeric">
            {dish.continent}
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/${dish.continentSlug}/${dish.countrySlug}/`} className="hover:text-turmeric">
            {dish.country}
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl text-ink">{dish.name}</h1>
          <AtlasPin confidenceLevel={dish.confidenceLevel} hasOccasion={hasOccasion} size={32} />
        </div>
        <AtlasRule />
      </header>

      <p className="font-body text-base text-ink/80">{dish.shortDescription}</p>

      <dl className="flex flex-col gap-4 border-t border-clay-line pt-6">
        <div>
          <dt className="font-meta text-xs uppercase tracking-wide text-ink/50">History</dt>
          <dd className="mt-1 font-body text-sm text-ink/80">{dish.historicNote}</dd>
        </div>
        <div>
          <dt className="font-meta text-xs uppercase tracking-wide text-ink/50">When it&apos;s eaten</dt>
          <dd className="mt-1 font-body text-sm text-ink/80">{dish.whenEaten}</dd>
        </div>
      </dl>

      {dish.pairedDrink.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-clay-line pt-6">
          <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">Paired drink</h2>
          <PairedDrinkList drinks={dish.pairedDrink} allDishes={allDishes} />
        </div>
      )}

      <p className="border border-dashed border-clay-line p-6 text-center font-body text-sm text-ink/60">
        Full recipe coming soon.
      </p>
    </main>
  );
}
