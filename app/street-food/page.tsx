import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { FilteredDishes } from "@/components/filters/FilteredDishes";
import { getAllDishes } from "@/lib/data/source";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Street Food",
  description: "Street-food dishes from every documented country, with dietary and meal-time filters.",
  path: "/street-food/",
});

export default async function StreetFoodPage(): Promise<React.JSX.Element> {
  const allDishes = await getAllDishes();
  const dishes = allDishes.filter((dish) => dish.streetFood);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl text-ink">Street Food</h1>
        <AtlasRule />
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <FilteredDishes dishes={dishes} emptyMessage="No street-food dishes documented yet." />
      </Suspense>
    </main>
  );
}
