import Link from "next/link";
import { resolvePairedDrink } from "@/lib/data/pairedDrink";
import type { Locale } from "@/lib/i18n";
import type { DishEntry } from "@/lib/types/recipe";

interface PairedDrinkListProps {
  /** Always the English pairedDrink values — the stable match key against
   * other dishes' (English) names, regardless of display locale. Never
   * translate this array itself; see translatedDrinks for the Bengali label. */
  drinks: string[];
  /** translations.bn.pairedDrink — same order/length as drinks, display-only.
   * A missing entry at index i falls back to drinks[i]. */
  translatedDrinks?: string[];
  allDishes: DishEntry[];
  locale?: Locale;
}

export function PairedDrinkList({
  drinks,
  translatedDrinks,
  allDishes,
  locale = "en",
}: PairedDrinkListProps): React.JSX.Element | null {
  if (drinks.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {drinks.map((drink, index) => {
        const drinkDish = resolvePairedDrink(drink, allDishes);
        const label = translatedDrinks?.[index] ?? drink;
        const href = drinkDish
          ? locale === "bn"
            ? `/bn/${drinkDish.continentSlug}/${drinkDish.countrySlug}/${drinkDish.slug}/`
            : `/${drinkDish.continentSlug}/${drinkDish.countrySlug}/${drinkDish.slug}/`
          : null;
        return (
          <li key={drink}>
            {href ? (
              <Link
                href={href}
                className="rounded-[5px] border border-clay-line px-4 py-2 font-body text-sm text-ink/80 hover:border-turmeric hover:text-ink"
              >
                {label}
              </Link>
            ) : (
              <span className="rounded-[5px] border border-dashed border-clay-line px-4 py-2 font-body text-sm text-ink/60">
                {label}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
