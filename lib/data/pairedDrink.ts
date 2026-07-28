import type { DishEntry } from "@/lib/types/recipe";

/** Matches a pairedDrink string to its own dish entry, if the drink is itself documented. */
export function resolvePairedDrink(name: string, allDishes: DishEntry[]): DishEntry | undefined {
  const target = name.toLowerCase();
  return allDishes.find((dish) => dish.name.toLowerCase() === target);
}
