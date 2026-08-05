"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DishGrid } from "@/components/dish/DishGrid";
import { FilterBar } from "@/components/filters/FilterBar";
import { filterDishes, type DishFilters } from "@/lib/data/filters";
import { getLocaleFromPathname } from "@/lib/i18n";
import type { DietaryFlags, DishEntry, MealTime } from "@/lib/types/recipe";

interface FilteredDishesProps {
  dishes: DishEntry[];
  emptyMessage?: string;
  hideMealTime?: boolean;
}

function parseFilters(params: URLSearchParams): DishFilters {
  const meal = params.get("meal");
  const diet = params.get("diet");
  return {
    mealTime: meal ? (meal.split(",") as MealTime[]) : undefined,
    dietary: diet ? (diet.split(",") as Array<keyof DietaryFlags>) : undefined,
  };
}

export function FilteredDishes({
  dishes,
  emptyMessage,
  hideMealTime = false,
}: FilteredDishesProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(usePathname());
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filtered = useMemo(() => filterDishes(dishes, filters), [dishes, filters]);

  return (
    <div className="flex flex-col gap-6">
      <FilterBar hideMealTime={hideMealTime} />
      <DishGrid dishes={filtered} emptyMessage={emptyMessage} locale={locale} />
    </div>
  );
}
