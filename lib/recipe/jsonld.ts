import { buildIngredientMap, resolveInstructionText } from "@/lib/recipe/instructions";
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

/** Requires the isFullRecipe-narrowed type — a discovery-only entry has no real
 * recipeInstructions, and emitting Recipe JSON-LD without them risks Google
 * ignoring or penalizing the markup. */
export function buildRecipeJsonLd(dish: FullRecipe, siteUrl?: string): Record<string, unknown> {
  const ingredientMap = buildIngredientMap(dish.ingredientGroups);
  const pagePath = `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`;

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: dish.name,
    description: dish.shortDescription,
    ...(dish.heroImage ? { image: [toAbsoluteUrl(dish.heroImage, siteUrl)] } : {}),
    url: toAbsoluteUrl(pagePath, siteUrl),
    recipeCategory: dish.category,
    recipeCuisine: dish.country,
    recipeYield: `${dish.baseServings} servings`,
    prepTime: toIsoDuration(dish.timing.prepMinutes),
    cookTime: toIsoDuration(dish.timing.activeCookMinutes),
    totalTime: toIsoDuration(dish.timing.totalMinutes),
    recipeIngredient: dish.ingredientGroups.flatMap((group) =>
      group.items.map((item) => formatIngredientLine(item)),
    ),
    recipeInstructions: dish.steps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: resolveInstructionText(step.instruction, ingredientMap),
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${dish.nutritionEstimate.calories} calories`,
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
export function buildFaqJsonLd(dish: FullRecipe): Record<string, unknown> | null {
  if (!dish.faq || dish.faq.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dish.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
