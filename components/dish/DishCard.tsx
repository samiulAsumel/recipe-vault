import Image from "next/image";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/dish/ConfidenceBadge";
import { getDictionary, type Locale } from "@/lib/i18n";
import { DIFFICULTY_LABELS } from "@/lib/i18n/labels";
import { formatMinutesLabel } from "@/lib/recipe/timers";
import type { DishEntry } from "@/lib/types/recipe";

interface DishCardProps {
  dish: DishEntry;
  locale?: Locale;
}

export function DishCard({ dish, locale = "en" }: DishCardProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const localizedName = locale === "bn" ? (dish.translations?.bn?.name ?? dish.name) : dish.name;
  const localizedDescription =
    locale === "bn"
      ? (dish.translations?.bn?.shortDescription ?? dish.shortDescription)
      : dish.shortDescription;

  const href =
    locale === "bn"
      ? `/bn/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`
      : `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`;

  return (
    <Link
      href={href}
      data-region={dish.continentSlug}
      className="group flex h-full flex-col border border-clay-line bg-parchment shadow-[0_1px_2px_rgba(36,27,20,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_10px_24px_rgba(36,27,20,0.14)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-clay-line">
        {dish.heroImage ? (
          <Image
            src={dish.heroImage}
            alt={localizedName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-clay-line/10">
            <span className="font-meta text-xs uppercase tracking-wide text-ink/30">{dish.country}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-display text-lg leading-tight text-ink">{localizedName}</h3>
          <ConfidenceBadge confidenceLevel={dish.confidenceLevel} locale={locale} />
        </div>

        <p className="line-clamp-2 font-body text-sm text-ink/70">{localizedDescription}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 font-meta text-xs text-ink/60">
          <span>{formatMinutesLabel(dish.totalTimeMinutes, locale)}</span>
          <span aria-hidden>·</span>
          <span>{DIFFICULTY_LABELS[locale][dish.difficulty]}</span>
          <span aria-hidden>·</span>
          <span>{dish.fullRecipeAvailable ? dict.dishCard.fullRecipe : dict.dishCard.discoveryEntry}</span>
        </div>
      </div>
    </Link>
  );
}
