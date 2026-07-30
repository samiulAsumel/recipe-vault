import type { DishEntry } from "@/lib/types/recipe";
import { CONTINENTS, DIETARY_FLAGS } from "@/lib/constants";
import type { ValidationIssue } from "./client";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert", "Drinks"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const CONFIDENCE_LEVELS = ["high", "medium", "low"];
const CATEGORIES = ["Mains", "Sides", "Snacks", "Desserts", "Drinks", "Breads", "Soups"];
const SPICE_LEVELS = ["Mild", "Medium", "Hot", "Very Hot"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Shape-level check for a v2 optional array field — only validated when present,
 * since none of these fields are required. Not exhaustive per-item validation. */
function checkOptionalArray(
  value: unknown,
  field: string,
  fail: (field: string, message: string) => void,
): void {
  if (value !== undefined && !Array.isArray(value)) {
    fail(field, `${field} must be an array when present`);
  }
}

/**
 * Client-side mirror of worker/lib/validateDish.ts — lets the form surface
 * per-field errors before a round trip, not a replacement for the server check.
 */
export function validateDish(dish: DishEntry): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (field: string, message: string): void => {
    issues.push({ field, message });
  };

  if (!isNonEmptyString(dish.name)) fail("name", "Name is required");
  if (!isNonEmptyString(dish.slug) || !SLUG_PATTERN.test(dish.slug)) {
    fail("slug", "Slug is required and must be lowercase letters, numbers, and hyphens only");
  }

  if (!isNonEmptyString(dish.country)) fail("country", "Country is required");
  if (!isNonEmptyString(dish.countrySlug) || !SLUG_PATTERN.test(dish.countrySlug)) {
    fail("countrySlug", "Country slug is required and must be lowercase letters, numbers, and hyphens only");
  }
  if (!CONTINENTS.some((c) => c.slug === dish.continentSlug)) {
    fail("continentSlug", "Continent is required");
  }

  if (dish.mealTime.length === 0) fail("mealTime", "Select at least one meal time");
  else if (!dish.mealTime.every((m) => MEAL_TIMES.includes(m))) {
    fail("mealTime", "Meal time contains an unrecognized value");
  }

  for (const flag of DIETARY_FLAGS) {
    if (typeof dish.dietary[flag.key] !== "boolean") {
      fail(`dietary.${flag.key}`, `${flag.label} must be set`);
    }
  }

  if (!DIFFICULTIES.includes(dish.difficulty)) fail("difficulty", "Difficulty is required");
  if (!Number.isFinite(dish.totalTimeMinutes) || dish.totalTimeMinutes <= 0) {
    fail("totalTimeMinutes", "Total time must be a positive number");
  }
  if (!isNonEmptyString(dish.historicNote)) fail("historicNote", "Historic note is required");
  if (!isNonEmptyString(dish.whenEaten)) fail("whenEaten", "When-eaten is required");
  if (!CONFIDENCE_LEVELS.includes(dish.confidenceLevel)) fail("confidenceLevel", "Confidence level is required");

  if (!isNonEmptyString(dish.shortDescription)) fail("shortDescription", "Short description is required");
  if (!isNonEmptyString(dish.heroImage)) fail("heroImage", "Hero image path is required");
  if (!CATEGORIES.includes(dish.category)) fail("category", "Category is required");

  // v2 discovery-tier enrichments — shape-checked only when present, never required.
  if (dish.spiceLevel !== undefined && !SPICE_LEVELS.includes(dish.spiceLevel)) {
    fail("spiceLevel", `Spice level must be one of: ${SPICE_LEVELS.join(", ")}`);
  }
  checkOptionalArray(dish.season, "season", fail);
  checkOptionalArray(dish.suitableFor, "suitableFor", fail);
  if (dish.story?.interestingFacts !== undefined) {
    checkOptionalArray(dish.story.interestingFacts, "story.interestingFacts", fail);
  }
  checkOptionalArray(dish.healthInfo?.benefits, "healthInfo.benefits", fail);
  checkOptionalArray(dish.healthInfo?.allergens, "healthInfo.allergens", fail);
  checkOptionalArray(dish.healthInfo?.dietaryConsiderations, "healthInfo.dietaryConsiderations", fail);

  if (dish.fullRecipeAvailable) {
    validateFullRecipe(dish, fail);
  }

  return issues;
}

function validateFullRecipe(dish: DishEntry, fail: (field: string, message: string) => void): void {
  if (!dish.baseServings || dish.baseServings <= 0) {
    fail("baseServings", "Base servings must be a positive number");
  }
  if (!isNonEmptyString(dish.headnote)) fail("headnote", "Headnote is required for a full recipe");

  if (!dish.ingredientGroups || dish.ingredientGroups.length === 0) {
    fail("ingredientGroups", "At least one ingredient group is required");
  }

  const knownIds = new Set<string>();
  dish.ingredientGroups?.forEach((group, groupIndex) => {
    if (!isNonEmptyString(group.groupName)) {
      fail(`ingredientGroups[${groupIndex}].groupName`, "Group name is required");
    }
    if (group.items.length === 0) {
      fail(`ingredientGroups[${groupIndex}].items`, "At least one ingredient is required in this group");
    }
    group.items.forEach((item, itemIndex) => {
      const path = `ingredientGroups[${groupIndex}].items[${itemIndex}]`;
      if (isNonEmptyString(item.id)) knownIds.add(item.id);
      if (!isNonEmptyString(item.name)) fail(`${path}.name`, "Ingredient name is required");
      if (!Number.isFinite(item.amount)) fail(`${path}.amount`, "Amount must be a number");
    });
  });

  if (!dish.steps || dish.steps.length === 0) {
    fail("steps", "At least one step is required");
  } else {
    const contiguous = dish.steps.every((step, i) => step.stepNumber === i + 1);
    if (!contiguous) fail("steps", "Step numbers must be contiguous starting at 1");

    dish.steps.forEach((step, index) => {
      const path = `steps[${index}]`;
      if (!isNonEmptyString(step.title)) fail(`${path}.title`, "Step title is required");
      if (!isNonEmptyString(step.instruction)) fail(`${path}.instruction`, "Step instruction is required");
      for (const ref of step.instruction.matchAll(/\{(\d{4})\}/g)) {
        if (!knownIds.has(ref[1])) {
          fail(`${path}.instruction`, `References unknown ingredient id {${ref[1]}}`);
        }
      }
    });
  }

  if (!isNonEmptyString(dish.donenessSummary)) {
    fail("donenessSummary", "Doneness summary is required for a full recipe");
  }

  if (
    dish.nutritionEstimate?.saturatedFatG !== undefined &&
    !Number.isFinite(dish.nutritionEstimate.saturatedFatG)
  ) {
    fail("nutritionEstimate.saturatedFatG", "Saturated fat must be a number when present");
  }

  // v2 full-recipe-tier enrichments — shape-checked only when present.
  checkOptionalArray(dish.alternativeEquipment, "alternativeEquipment", fail);
  checkOptionalArray(dish.commonMistakesSummary, "commonMistakesSummary", fail);
  checkOptionalArray(dish.recipeVariations, "recipeVariations", fail);
  checkOptionalArray(dish.faq, "faq", fail);
  dish.recipeVariations?.forEach((variation, index) => {
    if (!isNonEmptyString(variation.type) || !isNonEmptyString(variation.description)) {
      fail(`recipeVariations[${index}]`, "Each variation needs a type and a description");
    }
  });
  dish.faq?.forEach((item, index) => {
    if (!isNonEmptyString(item.question) || !isNonEmptyString(item.answer)) {
      fail(`faq[${index}]`, "Each FAQ entry needs a question and an answer");
    }
  });
  dish.preparationSteps?.forEach((step, index) => {
    if (!isNonEmptyString(step.category) || !isNonEmptyString(step.instruction)) {
      fail(`preparationSteps[${index}]`, "Each preparation step needs a category and an instruction");
    }
  });
  dish.chefTipCategories?.forEach((tip, index) => {
    if (!isNonEmptyString(tip.category) || !isNonEmptyString(tip.tip)) {
      fail(`chefTipCategories[${index}]`, "Each chef tip needs a category and a tip");
    }
  });
  if (dish.estimatedCost !== undefined) {
    if (!Number.isFinite(dish.estimatedCost.costPerServing)) {
      fail("estimatedCost.costPerServing", "Cost per serving must be a number");
    }
    if (!isNonEmptyString(dish.estimatedCost.currency)) {
      fail("estimatedCost.currency", "Currency is required when estimated cost is set");
    }
  }
}
