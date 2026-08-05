import { DishCard } from "@/components/dish/DishCard";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { DishEntry } from "@/lib/types/recipe";

interface DishGridProps {
  dishes: DishEntry[];
  emptyMessage?: string;
  locale?: Locale;
  /** Skip alphabetical sorting and render `dishes` in the order given — for
   * relevance-ranked results (e.g. an active Fuse.js search query) where the
   * caller's order carries meaning. Every other listing sorts A-Z by default. */
  preserveOrder?: boolean;
}

function dishSortName(dish: DishEntry, locale: Locale): string {
  return locale === "bn" ? (dish.translations?.bn?.name ?? dish.name) : dish.name;
}

export function DishGrid({
  dishes,
  emptyMessage,
  locale = "en",
  preserveOrder = false,
}: DishGridProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const message = emptyMessage ?? dict.dishGrid.emptyDefault;

  if (dishes.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-dashed border-clay-line p-8 text-center font-body text-sm text-ink/60">
        {message}
      </p>
    );
  }

  const orderedDishes = preserveOrder
    ? dishes
    : [...dishes].sort((a, b) =>
        dishSortName(a, locale).localeCompare(dishSortName(b, locale), locale === "bn" ? "bn-BD" : "en-US"),
      );

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orderedDishes.map((dish, index) => (
        <div
          key={dish.id}
          className="fade-up-item h-full"
          style={{ "--fade-index": index % 12 } as React.CSSProperties}
        >
          <DishCard dish={dish} locale={locale} />
        </div>
      ))}
    </div>
  );
}
