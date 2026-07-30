import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { FilteredDishes } from "@/components/filters/FilteredDishes";
import { filterDishes } from "@/lib/data/filters";
import { getAllDishes } from "@/lib/data/source";
import { bn as dict } from "@/lib/i18n/dictionaries/bn";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: dict.mealHubs.dinner.title,
  description: dict.mealHubs.dinner.description,
  path: "/bn/dinner/",
});

export default async function DinnerPageBn(): Promise<React.JSX.Element> {
  const allDishes = await getAllDishes();
  const dishes = filterDishes(allDishes, { mealTime: ["Dinner"] });

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl text-ink">{dict.mealHubs.dinner.title}</h1>
        <AtlasRule />
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <FilteredDishes dishes={dishes} emptyMessage={dict.mealHubs.dinner.emptyMessage} hideMealTime />
      </Suspense>
    </main>
  );
}
