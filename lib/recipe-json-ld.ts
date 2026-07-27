import { resolveInstructionText } from '@/lib/ingredient-references';
import { formatAmountWithUnit } from '@/lib/ingredient-scaling';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';
import type { FullRecipe, IngredientItem } from '@/types/recipe';

function minutesToIsoDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `PT${minutes}M`;
  if (minutes === 0) return `PT${hours}H`;
  return `PT${hours}H${minutes}M`;
}

function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Section 7: schema.org Recipe JSON-LD, full-recipe pages only - discovery entries don't have
 * ingredients/instructions/nutrition to mark up. `author` is the site itself (an Organization),
 * never a fabricated human name - the project's own rule (Section: "never fabricate ... named
 * human authors"). No `aggregateRating` - there's no review system to source one from. */
export function buildRecipeJsonLd(recipe: FullRecipe): Record<string, unknown> {
  const ingredientsById = new Map<string, IngredientItem>();
  for (const group of recipe.ingredientGroups) {
    for (const item of group.items) {
      ingredientsById.set(item.id, item);
    }
  }

  const recipeIngredient = recipe.ingredientGroups.flatMap((group) =>
    group.items.map((item) => {
      const amount = formatAmountWithUnit(item.amount, item.unit);
      return item.prepNote ? `${amount} ${item.name}, ${item.prepNote}` : `${amount} ${item.name}`;
    }),
  );

  const recipeInstructions = recipe.steps.map((step) => ({
    '@type': 'HowToStep',
    name: step.title,
    text: resolveInstructionText(step.instruction, ingredientsById),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    image: [absoluteUrl(recipe.heroImage)],
    description: recipe.shortDescription,
    author: { '@type': 'Organization', name: SITE_NAME },
    recipeCuisine: recipe.country,
    recipeCategory: recipe.category,
    prepTime: minutesToIsoDuration(recipe.timing.prepMinutes + recipe.timing.marinateMinutes),
    cookTime: minutesToIsoDuration(recipe.timing.activeCookMinutes + recipe.timing.restMinutes),
    totalTime: minutesToIsoDuration(recipe.timing.totalMinutes),
    recipeYield: `${recipe.baseServings} servings`,
    recipeIngredient,
    recipeInstructions,
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.nutritionEstimate.calories} calories`,
      proteinContent: `${recipe.nutritionEstimate.proteinG}g`,
      carbohydrateContent: `${recipe.nutritionEstimate.carbsG}g`,
      fatContent: `${recipe.nutritionEstimate.fatG}g`,
    },
  };
}
