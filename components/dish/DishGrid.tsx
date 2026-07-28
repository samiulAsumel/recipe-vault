import { DishCard } from "@/components/dish/DishCard";
import type { DishEntry } from "@/lib/types/recipe";

interface DishGridProps {
  dishes: DishEntry[];
  emptyMessage?: string;
}

export function DishGrid({
  dishes,
  emptyMessage = "No dishes match yet.",
}: DishGridProps): React.JSX.Element {
  if (dishes.length === 0) {
    return (
      <p className="border border-dashed border-clay-line p-8 text-center font-body text-sm text-ink/60">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {dishes.map((dish, index) => (
        <div
          key={dish.id}
          className="fade-up-item"
          style={{ "--fade-index": index % 12 } as React.CSSProperties}
        >
          <DishCard dish={dish} />
        </div>
      ))}
    </div>
  );
}
