import type { DishEntry } from "@/lib/types/recipe";
import { CONTINENTS, DIETARY_FLAGS } from "@/lib/constants";
import type { ValidationIssue } from "./client";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert", "Drinks"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const CONFIDENCE_LEVELS = ["high", "medium", "low"];
const CATEGORIES = ["Mains", "Sides", "Snacks", "Desserts", "Drinks", "Breads", "Soups"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
}
