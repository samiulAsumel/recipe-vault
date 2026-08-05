import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { SubstitutionResults } from "@/components/substitutions/SubstitutionResults";
import { getAllDishes } from "@/lib/data/source";
import { en as dict } from "@/lib/i18n/dictionaries/en";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: dict.substitutions.metaTitle,
  description: dict.substitutions.metaDescription,
  path: "/substitutions/",
});

export default async function SubstitutionsPage(): Promise<React.JSX.Element> {
  const dishes = await getAllDishes();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl text-ink">{dict.substitutions.heading}</h1>
        <AtlasRule />
        <p className="font-body text-base text-ink/70">{dict.substitutions.intro}</p>
      </header>

      <Suspense fallback={<div className="h-32" aria-hidden />}>
        <SubstitutionResults dishes={dishes} />
      </Suspense>
    </main>
  );
}
