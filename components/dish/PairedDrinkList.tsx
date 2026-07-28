import Link from "next/link";
import { resolvePairedDrink } from "@/lib/data/pairedDrink";
import type { DishEntry } from "@/lib/types/recipe";

interface PairedDrinkListProps {
  drinks: string[];
  allDishes: DishEntry[];
}

export function PairedDrinkList({
  drinks,
  allDishes,
}: PairedDrinkListProps): React.JSX.Element | null {
  if (drinks.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {drinks.map((drink) => {
        const drinkDish = resolvePairedDrink(drink, allDishes);
        return (
          <li key={drink}>
            {drinkDish ? (
              <Link
                href={`/${drinkDish.continentSlug}/${drinkDish.countrySlug}/${drinkDish.slug}/`}
                className="border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-ink hover:text-ink"
              >
                {drink}
              </Link>
            ) : (
              <span className="border border-dashed border-clay-line px-4 py-2 font-body text-sm text-ink/60">
                {drink}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
