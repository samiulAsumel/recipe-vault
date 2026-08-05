import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AtlasPin } from "@/components/atlas/AtlasPin";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { DishPlaceholderArt } from "@/components/dish/DishPlaceholderArt";
import { PairedDrinkList } from "@/components/dish/PairedDrinkList";
import { RelatedDishes } from "@/components/dish/RelatedDishes";
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
import { bn as dict } from "@/lib/i18n/dictionaries/bn";
import { localizeContinentName, localizeCountryName } from "@/lib/i18n/labels";
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

  const bn = dish.translations?.bn;
  const name = bn?.name ?? dish.name;
  const description = bn?.shortDescription ?? dish.shortDescription;
  const siteUrl = getSiteUrl();
  const enPath = `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`;
  const path = `/bn${enPath}`;
  const absoluteImage = dish.heroImage
    ? siteUrl
      ? `${siteUrl}${dish.heroImage}`
      : dish.heroImage
    : undefined;

  return {
    title: name,
    description,
    ...(siteUrl
      ? {
          alternates: {
            canonical: `${siteUrl}${path}`,
            languages: { en: `${siteUrl}${enPath}`, bn: `${siteUrl}${path}` },
          },
        }
      : {}),
    openGraph: {
      title: name,
      description,
      type: "article",
      locale: "bn_BD",
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
    },
  };
}

export default async function DishPageBn({
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
    return <DiscoveryDetail dish={dish} allDishes={allDishes} locale="bn" />;
  }

  const jsonLd = buildRecipeJsonLd(dish, getSiteUrl(), "bn");
  const faqJsonLd = buildFaqJsonLd(dish, "bn");
  const hasOccasion = dish.streetFood || dish.occasion.length > 0;
  const bn = dish.translations?.bn;
  const name = bn?.name ?? dish.name;
  const headnote = bn?.headnote ?? dish.headnote;
  const equipment = bn?.equipment ?? dish.equipment;
  const miseEnPlace = bn?.miseEnPlace ?? dish.miseEnPlace;
  const donenessSummary = bn?.donenessSummary ?? dish.donenessSummary;
  const platingNote = bn?.platingNote ?? dish.platingNote;
  const storageNote = bn?.storageNote ?? dish.storageNote;
  const chefTips = bn?.chefTips ?? dish.chefTips;
  const substitutions =
    bn?.substitutions && bn.substitutions.length === dish.substitutions.length
      ? bn.substitutions
      : dish.substitutions;
  const regionalVariations = bn?.regionalVariations ?? dish.regionalVariations;

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
            <Link href={`/bn/${dish.continentSlug}/`} className="hover:text-turmeric">
              {localizeContinentName(dish.continent, "bn")}
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/bn/${dish.continentSlug}/${dish.countrySlug}/`}
              className="hover:text-turmeric"
            >
              {localizeCountryName(dish.country, "bn")}
            </Link>
          </div>
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[var(--radius-card)] border border-clay-line">
            {dish.heroImage ? (
              <Image
                src={dish.heroImage}
                alt={name}
                fill
                priority
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover"
              />
            ) : (
              <DishPlaceholderArt
                country={localizeCountryName(dish.country, "bn")}
                regionSlug={dish.continentSlug}
                size="lg"
              />
            )}
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl text-ink sm:text-5xl">{name}</h1>
            <div className="flex items-center gap-4">
              <CookModeLauncher />
              <AtlasPin
                confidenceLevel={dish.confidenceLevel}
                hasOccasion={hasOccasion}
                size={40}
                locale="bn"
              />
            </div>
          </div>
          <AtlasRule />
          <p className="max-w-prose font-body text-base text-ink/80">{headnote}</p>
        </header>

        <RecipeSummary dish={dish} locale="bn" />

        {equipment.length > 0 && (
          <section className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-clay-line/5 p-5">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {dict.dish.equipment}
            </h2>
            <ul className="flex flex-wrap gap-2 font-body text-sm text-ink/80">
              {equipment.map((item) => (
                <li key={item} className="rounded-[5px] border border-clay-line bg-surface px-3 py-1">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[380px_1fr]">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
            {miseEnPlace.length > 0 && (
              <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-clay-line bg-surface p-4">
                <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
                  {dict.dish.miseEnPlace}
                </h2>
                <ul className="flex flex-col gap-1 font-body text-sm text-ink/80">
                  {miseEnPlace.map((item) => (
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
            <RecipeSteps dish={dish} locale="bn" />
          </div>
        </div>

        <section className="flex flex-col gap-6 rounded-[var(--radius-card)] bg-clay-line/5 p-6 sm:flex-row sm:gap-10">
          <div className="flex-1">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {dict.dish.doneness}
            </h2>
            <p className="mt-1 font-body text-sm text-ink/80">{donenessSummary}</p>
          </div>
          <div className="flex-1">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {dict.dish.plating}
            </h2>
            <p className="mt-1 font-body text-sm text-ink/80">{platingNote}</p>
          </div>
          <div className="flex-1">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {dict.dish.storage}
            </h2>
            <p className="mt-1 font-body text-sm text-ink/80">{storageNote}</p>
          </div>
        </section>

        {chefTips.length > 0 && (
          <section className="flex flex-col gap-2 rounded-r-[var(--radius-card)] border-l-2 border-turmeric bg-turmeric/5 p-5">
            <h2 className="font-meta text-xs uppercase tracking-wide text-turmeric">
              {dict.dish.chefTips}
            </h2>
            <ul className="flex flex-col gap-1.5 font-body text-sm text-ink/80">
              {chefTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {substitutions.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-ink">{dict.dish.substitutions}</h2>
            <ul className="flex flex-col gap-2">
              {substitutions.map((sub) => (
                <li key={sub.original} className="font-body text-sm text-ink/80">
                  <span className="font-medium text-ink">{sub.original}</span> →{" "}
                  <span className="font-medium text-ink">{sub.swap}</span>
                  <span className="text-ink/60"> — {sub.impact}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {regionalVariations.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-ink">{dict.dish.regionalVariations}</h2>
            <ul className="flex flex-col gap-1.5 font-body text-sm text-ink/80">
              {regionalVariations.map((variation) => (
                <li key={variation}>{variation}</li>
              ))}
            </ul>
          </section>
        )}

        {dish.healthInfo && (
          <HealthInformation healthInfo={dish.healthInfo} translatedHealthInfo={bn?.healthInfo} locale="bn" />
        )}

        {dish.story && <RecipeStory story={dish.story} translatedStory={bn?.story} locale="bn" />}

        {dish.pairedDrink.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-clay-line pt-8">
            <h2 className="font-display text-xl text-ink">{dict.dish.pairedDrink}</h2>
            <PairedDrinkList
              drinks={dish.pairedDrink}
              translatedDrinks={bn?.pairedDrink}
              allDishes={allDishes}
              locale="bn"
            />
          </section>
        )}

        <RelatedDishes dish={dish} allDishes={allDishes} locale="bn" />
        </main>
        <CookMode dish={dish} />
      </RecipeWorkspace>
    </Suspense>
  );
}
