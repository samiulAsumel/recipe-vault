import type { Locale } from "@/lib/i18n";
import { applyIngredientTranslations, buildIngredientMap, resolveInstructionText } from "@/lib/recipe/instructions";
import { formatAmount } from "@/lib/recipe/scaling";
import type { FullRecipe, IngredientItem } from "@/lib/types/recipe";

function toIsoDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `PT${remainingMinutes}M`;
  if (remainingMinutes === 0) return `PT${hours}H`;
  return `PT${hours}H${remainingMinutes}M`;
}

function toAbsoluteUrl(path: string, siteUrl?: string): string {
  return siteUrl ? `${siteUrl.replace(/\/+$/, "")}${path}` : path;
}

function formatIngredientLine(item: IngredientItem): string {
  const amount = formatAmount(item.amount);
  const parts = [amount, item.unit, item.name].filter((part): part is string => Boolean(part));
  return parts.join(" ");
}

/** Words baked directly into JSON-LD string values (not just UI labels), so a
 * Bengali page's structured data reads correctly rather than mixing English
 * words into Bengali-tagged (inLanguage: "bn") markup. */
const WORDS: Record<Locale, { servings: string; calories: string }> = {
  en: { servings: "servings", calories: "calories" },
  bn: { servings: "পরিবেশন", calories: "ক্যালরি" },
};

/** Requires the isFullRecipe-narrowed type — a discovery-only entry has no real
 * recipeInstructions, and emitting Recipe JSON-LD without them risks Google
 * ignoring or penalizing the markup. */
export function buildRecipeJsonLd(
  dish: FullRecipe,
  siteUrl?: string,
  locale: Locale = "en",
): Record<string, unknown> {
  const bn = locale === "bn" ? dish.translations?.bn : undefined;
  const ingredientGroups = applyIngredientTranslations(dish.ingredientGroups, bn);
  const ingredientMap = buildIngredientMap(ingredientGroups);
  const pagePath =
    locale === "bn"
      ? `/bn/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`
      : `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`;
  const words = WORDS[locale];
  const name = bn?.name ?? dish.name;
  const description = bn?.shortDescription ?? dish.shortDescription;
  const steps = dish.steps.map((step) => {
    const t = bn?.steps?.[step.stepNumber];
    return {
      stepNumber: step.stepNumber,
      title: t?.title ?? step.title,
      instruction: t?.instruction ?? step.instruction,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description,
    inLanguage: locale,
    ...(dish.heroImage ? { image: [toAbsoluteUrl(dish.heroImage, siteUrl)] } : {}),
    url: toAbsoluteUrl(pagePath, siteUrl),
    recipeCategory: dish.category,
    recipeCuisine: dish.country,
    recipeYield: `${dish.baseServings} ${words.servings}`,
    prepTime: toIsoDuration(dish.timing.prepMinutes),
    cookTime: toIsoDuration(dish.timing.activeCookMinutes),
    totalTime: toIsoDuration(dish.timing.totalMinutes),
    recipeIngredient: ingredientGroups.flatMap((group) =>
      group.items.map((item) => formatIngredientLine(item)),
    ),
    recipeInstructions: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: resolveInstructionText(step.instruction, ingredientMap),
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${dish.nutritionEstimate.calories} ${words.calories}`,
      proteinContent: `${dish.nutritionEstimate.proteinG}g`,
      carbohydrateContent: `${dish.nutritionEstimate.carbsG}g`,
      fatContent: `${dish.nutritionEstimate.fatG}g`,
      // saturatedFat/fiber/sugar/sodium/cholesterol are the only v2 nutrition
      // fields with a real schema.org NutritionInformation property —
      // potassium/iron/calcium/vitamins have no standard property and stay
      // display-only, not structured data.
      ...(dish.nutritionEstimate.saturatedFatG !== undefined
        ? { saturatedFatContent: `${dish.nutritionEstimate.saturatedFatG}g` }
        : {}),
      ...(dish.nutritionEstimate.fiberG !== undefined
        ? { fiberContent: `${dish.nutritionEstimate.fiberG}g` }
        : {}),
      ...(dish.nutritionEstimate.sugarG !== undefined
        ? { sugarContent: `${dish.nutritionEstimate.sugarG}g` }
        : {}),
      ...(dish.nutritionEstimate.sodiumMg !== undefined
        ? { sodiumContent: `${dish.nutritionEstimate.sodiumMg}mg` }
        : {}),
      ...(dish.nutritionEstimate.cholesterolMg !== undefined
        ? { cholesterolContent: `${dish.nutritionEstimate.cholesterolMg}mg` }
        : {}),
    },
  };
}

/** Returns null when the dish has no FAQ content, rather than emitting an empty
 * FAQPage block. */
export function buildFaqJsonLd(dish: FullRecipe, locale: Locale = "en"): Record<string, unknown> | null {
  if (!dish.faq || dish.faq.length === 0) return null;
  const bn = locale === "bn" ? dish.translations?.bn : undefined;
  const faq = bn?.faq && bn.faq.length === dish.faq.length ? bn.faq : dish.faq;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
