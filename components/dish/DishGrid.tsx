import { DishCard } from "@/components/dish/DishCard";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { DishEntry } from "@/lib/types/recipe";

interface DishGridProps {
  dishes: DishEntry[];
  emptyMessage?: string;
  locale?: Locale;
}

export function DishGrid({ dishes, emptyMessage, locale = "en" }: DishGridProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const message = emptyMessage ?? dict.dishGrid.emptyDefault;

  if (dishes.length === 0) {
    return (
      <p className="border border-dashed border-clay-line p-8 text-center font-body text-sm text-ink/60">
        {message}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {dishes.map((dish, index) => (
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
