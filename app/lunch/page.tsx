import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { FilteredDishes } from "@/components/filters/FilteredDishes";
import { filterDishes } from "@/lib/data/filters";
import { getAllDishes } from "@/lib/data/source";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lunch",
  description: "Lunch dishes from every documented country, with dietary and occasion filters.",
  path: "/lunch/",
});

export default async function LunchPage(): Promise<React.JSX.Element> {
  const allDishes = await getAllDishes();
  const dishes = filterDishes(allDishes, { mealTime: ["Lunch"] });

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl text-ink">Lunch</h1>
        <AtlasRule />
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <FilteredDishes dishes={dishes} emptyMessage="No lunch dishes documented yet." hideMealTime />
      </Suspense>
    </main>
  );
}
