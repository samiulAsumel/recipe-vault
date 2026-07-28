import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { SearchResults } from "@/components/search/SearchResults";
import { getAllDishes } from "@/lib/data/source";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Search",
  description:
    "Search every documented dish by name, country, or description, with continent, meal-time, dietary, and occasion filters.",
  path: "/search/",
});

export default async function SearchPage(): Promise<React.JSX.Element> {
  const dishes = await getAllDishes();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl text-ink">Search</h1>
        <AtlasRule />
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <SearchResults dishes={dishes} />
      </Suspense>
    </main>
  );
}
