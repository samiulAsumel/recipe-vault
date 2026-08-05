import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { DishPlaceholderArt } from "@/components/dish/DishPlaceholderArt";
import { PairedDrinkList } from "@/components/dish/PairedDrinkList";
import { CookMode } from "@/components/recipe/CookMode";
import { CookModeLauncher } from "@/components/recipe/CookModeLauncher";
import { DiscoveryDetail } from "@/components/recipe/DiscoveryDetail";
import { HealthInformation } from "@/components/recipe/HealthInformation";
import { RecipeSteps } from "@/components/recipe/RecipeSteps";
import { RecipeStory } from "@/components/recipe/RecipeStory";
import { RecipeSummary } from "@/components/recipe/RecipeSummary";
import { RecipeWorkspace } from "@/components/recipe/RecipeWorkspace";
import { ServingsIngredients } from "@/components/recipe/ServingsIngredients";
import { CONTINENTS, EMPTY_STATIC_PARAM } from "@/lib/constants";
import { getAllDishes, getDish } from "@/lib/data/source";
import { getSiteUrl } from "@/lib/env";
import { buildFaqJsonLd, buildRecipeJsonLd } from "@/lib/recipe/jsonld";
import { isFullRecipe } from "@/lib/types/recipe";

export const dynamicParams = false;

// See the note in [country]/page.tsx generateStaticParams — full ancestor path required.
export async function generateStaticParams(): Promise<
  Array<{
    continent: string;
    country: string;
    dish: string;
  }>
> {
  const dishes = await getAllDishes();
  if (dishes.length === 0) {
    return [
      { continent: CONTINENTS[0].slug, country: EMPTY_STATIC_PARAM, dish: EMPTY_STATIC_PARAM },
    ];
  }
  return dishes.map((dish) => ({
    continent: dish.continentSlug,
    country: dish.countrySlug,
    dish: dish.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ continent: string; country: string; dish: string }>;
}): Promise<Metadata> {
  const { country, dish: dishSlug } = await params;
  const dish = await getDish(country, dishSlug);
  if (!dish) return {};

  const siteUrl = getSiteUrl();
  const path = `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`;
  const bnPath = `/bn${path}`;
  const absoluteImage = dish.heroImage
    ? siteUrl
      ? `${siteUrl}${dish.heroImage}`
      : dish.heroImage
    : undefined;

  return {
    title: dish.name,
    description: dish.shortDescription,
    ...(siteUrl
      ? {
          alternates: {
            canonical: `${siteUrl}${path}`,
            languages: { en: `${siteUrl}${path}`, bn: `${siteUrl}${bnPath}` },
          },
        }
      : {}),
    openGraph: {
      title: dish.name,
      description: dish.shortDescription,
      type: "article",
      locale: "en_US",
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
    },
  };
}

export default async function DishPage({
  params,
}: {
  params: Promise<{ continent: string; country: string; dish: string }>;
}): Promise<React.JSX.Element> {
  const { country, dish: dishSlug } = await params;
  const [dish, allDishes] = await Promise.all([getDish(country, dishSlug), getAllDishes()]);

  if (!dish) {
    notFound();
  }

  if (!isFullRecipe(dish)) {
    return <DiscoveryDetail dish={dish} allDishes={allDishes} />;
  }

  const jsonLd = buildRecipeJsonLd(dish, getSiteUrl());
  const faqJsonLd = buildFaqJsonLd(dish);
  const hasOccasion = dish.streetFood || dish.occasion.length > 0;

  return (
    <Suspense>
      <RecipeWorkspace dish={dish}>
        {/* schema.org Recipe JSON-LD; "<" is escaped below to guard against a </script> breakout once this data becomes admin-editable (Phase 7) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3 font-meta text-xs uppercase tracking-wide text-ink/50">
            <Link href={`/${dish.continentSlug}/`} className="hover:text-turmeric">
              {dish.continent}
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/${dish.continentSlug}/${dish.countrySlug}/`}
              className="hover:text-turmeric"
            >
              {dish.country}
            </Link>
          </div>
          <div className="relative aspect-[21/9] w-full overflow-hidden border border-clay-line">
            {dish.heroImage ? (
              <Image
                src={dish.heroImage}
                alt={dish.name}
                fill
                priority
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover"
              />
            ) : (
              <DishPlaceholderArt country={dish.country} regionSlug={dish.continentSlug} size="lg" />
            )}
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl text-ink sm:text-5xl">{dish.name}</h1>
            <div className="flex items-center gap-4">
              <CookModeLauncher />
              <AtlasPin confidenceLevel={dish.confidenceLevel} hasOccasion={hasOccasion} size={40} />
            </div>
          </div>
          <AtlasRule />
          <p className="max-w-prose font-body text-base text-ink/80">{dish.headnote}</p>
        </header>

        <RecipeSummary dish={dish} />

        {dish.equipment.length > 0 && (
          <section className="flex flex-col gap-3 bg-clay-line/5 p-5">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">Equipment</h2>
            <ul className="flex flex-wrap gap-2 font-body text-sm text-ink/80">
              {dish.equipment.map((item) => (
                <li key={item} className="border border-clay-line bg-parchment px-3 py-1">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[380px_1fr]">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
            {dish.miseEnPlace.length > 0 && (
              <div className="flex flex-col gap-2 border border-clay-line p-4">
                <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
                  Mise en place
                </h2>
                <ul className="flex flex-col gap-1 font-body text-sm text-ink/80">
                  {dish.miseEnPlace.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden>–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ServingsIngredients dish={dish} />
          </aside>

          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <CookModeLauncher />
            </div>
            <RecipeSteps dish={dish} />
          </div>
        </div>

        <section className="flex flex-col gap-6 bg-clay-line/5 p-6 sm:flex-row sm:gap-10">
          <div className="flex-1">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">Doneness</h2>
            <p className="mt-1 font-body text-sm text-ink/80">{dish.donenessSummary}</p>
          </div>
          <div className="flex-1">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">Plating</h2>
            <p className="mt-1 font-body text-sm text-ink/80">{dish.platingNote}</p>
          </div>
          <div className="flex-1">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">Storage</h2>
            <p className="mt-1 font-body text-sm text-ink/80">{dish.storageNote}</p>
          </div>
        </section>

        {dish.chefTips.length > 0 && (
          <section className="flex flex-col gap-2 border-l-2 border-turmeric bg-turmeric/5 p-5">
            <h2 className="font-meta text-xs uppercase tracking-wide text-turmeric">Chef&apos;s tips</h2>
            <ul className="flex flex-col gap-1.5 font-body text-sm text-ink/80">
              {dish.chefTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {dish.substitutions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-ink">Substitutions</h2>
            <ul className="flex flex-col gap-2">
              {dish.substitutions.map((sub) => (
                <li key={sub.original} className="font-body text-sm text-ink/80">
                  <span className="font-medium text-ink">{sub.original}</span> →{" "}
                  <span className="font-medium text-ink">{sub.swap}</span>
                  <span className="text-ink/60"> — {sub.impact}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {dish.regionalVariations.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-ink">Regional variations</h2>
            <ul className="flex flex-col gap-1.5 font-body text-sm text-ink/80">
              {dish.regionalVariations.map((variation) => (
                <li key={variation}>{variation}</li>
              ))}
            </ul>
          </section>
        )}

        {dish.healthInfo && <HealthInformation healthInfo={dish.healthInfo} />}

        {dish.story && <RecipeStory story={dish.story} />}

        {dish.pairedDrink.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-clay-line pt-8">
            <h2 className="font-display text-xl text-ink">Paired drink</h2>
            <PairedDrinkList drinks={dish.pairedDrink} allDishes={allDishes} />
          </section>
        )}
        </main>
        <CookMode dish={dish} />
      </RecipeWorkspace>
    </Suspense>
  );
}
