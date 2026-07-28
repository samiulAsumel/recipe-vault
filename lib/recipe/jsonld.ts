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
    },
  };
}
