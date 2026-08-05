import { DishGrid } from "@/components/dish/DishGrid";
import { getRelatedDishes } from "@/lib/data/related";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { DishEntry } from "@/lib/types/recipe";

interface RelatedDishesProps {
  dish: DishEntry;
  allDishes: DishEntry[];
  locale?: Locale;
}

export function RelatedDishes({
  dish,
  allDishes,
  locale = "en",
}: RelatedDishesProps): React.JSX.Element | null {
  const related = getRelatedDishes(dish, allDishes);
  if (related.length === 0) return null;

  const dict = getDictionary(locale);

  return (
    <section className="flex flex-col gap-3 border-t border-clay-line pt-8">
      <h2 className="font-display text-xl text-ink">{dict.relatedDishes.heading}</h2>
      {/* Score order carries meaning here, same reason DishGrid's search results
       * skip its default A-Z sort. */}
      <DishGrid dishes={related} locale={locale} preserveOrder />
    </section>
  );
}
