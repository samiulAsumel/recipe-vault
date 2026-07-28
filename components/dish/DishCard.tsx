import Image from "next/image";
import Link from "next/link";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import type { DishEntry } from "@/lib/types/recipe";

interface DishCardProps {
  dish: DishEntry;
}

export function DishCard({ dish }: DishCardProps): React.JSX.Element {
  const hasOccasion = dish.streetFood || dish.occasion.length > 0;

  return (
    <Link
      href={`/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`}
      data-region={dish.continentSlug}
      className="group flex flex-col border border-clay-line bg-parchment transition-colors hover:border-ink"
    >
      {dish.heroImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-clay-line">
          <Image
            src={dish.heroImage}
            alt={dish.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-tight text-ink">{dish.name}</h3>
          <AtlasPin confidenceLevel={dish.confidenceLevel} hasOccasion={hasOccasion} />
        </div>

        <p className="line-clamp-2 font-body text-sm text-ink/70">{dish.shortDescription}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 font-meta text-xs text-ink/60">
          <span>{dish.totalTimeMinutes} min</span>
          <span aria-hidden>·</span>
          <span>{dish.difficulty}</span>
          <span aria-hidden>·</span>
          <span>{dish.fullRecipeAvailable ? "Full recipe" : "Discovery entry"}</span>
        </div>
      </div>
    </Link>
  );
}
