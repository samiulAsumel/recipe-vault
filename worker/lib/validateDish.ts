import { SLUG_PATTERN } from "../types";

export interface ValidationIssue {
  field: string;
  message: string;
}

const CONTINENT_SLUGS = ["asia", "europe", "africa", "americas", "oceania"];
const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert", "Drinks"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const CONFIDENCE_LEVELS = ["high", "medium", "low"];
const CATEGORIES = ["Mains", "Sides", "Snacks", "Desserts", "Drinks", "Breads", "Soups"];
const DIETARY_KEYS = [
  "vegetarian",
  "vegan",
  "glutenFree",
  "dairyFree",
  "eggFree",
  "nutFree",
  "lowCarb",
  "highProtein",
] as const;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateDish(dish: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (field: string, message: string): void => {
    issues.push({ field, message });
  };

  if (!isNonEmptyString(dish?.id)) fail("id", "id is required");
  if (!isNonEmptyString(dish?.slug) || !SLUG_PATTERN.test(dish.slug)) {
    fail("slug", "slug is required and must match ^[a-z0-9-]+$");
  }
  if (!isNonEmptyString(dish?.name)) fail("name", "name is required");

  if (!isNonEmptyString(dish?.country)) fail("country", "country is required");
  if (!isNonEmptyString(dish?.countrySlug) || !SLUG_PATTERN.test(dish.countrySlug)) {
    fail("countrySlug", "countrySlug is required and must match ^[a-z0-9-]+$");
  }
  if (!isNonEmptyString(dish?.continent)) fail("continent", "continent is required");
  if (!CONTINENT_SLUGS.includes(dish?.continentSlug)) {
    fail("continentSlug", `continentSlug must be one of: ${CONTINENT_SLUGS.join(", ")}`);
  }

  if (!Array.isArray(dish?.mealTime) || dish.mealTime.length === 0) {
    fail("mealTime", "at least one meal time is required");
  } else if (!dish.mealTime.every((m: unknown) => MEAL_TIMES.includes(m as string))) {
    fail("mealTime", `mealTime values must be from: ${MEAL_TIMES.join(", ")}`);
  }
  if (!Array.isArray(dish?.occasion)) fail("occasion", "occasion must be an array");
  if (typeof dish?.streetFood !== "boolean") fail("streetFood", "streetFood must be a boolean");

  if (typeof dish?.dietary !== "object" || dish.dietary === null) {
    fail("dietary", "dietary flags object is required");
  } else {
    for (const key of DIETARY_KEYS) {
      if (typeof dish.dietary[key] !== "boolean") {
        fail(`dietary.${key}`, `dietary.${key} must be a boolean`);
      }
    }
  }

  if (!DIFFICULTIES.includes(dish?.difficulty)) {
    fail("difficulty", `difficulty must be one of: ${DIFFICULTIES.join(", ")}`);
  }
  if (typeof dish?.totalTimeMinutes !== "number" || dish.totalTimeMinutes <= 0) {
    fail("totalTimeMinutes", "totalTimeMinutes must be a positive number");
  }
  if (!isNonEmptyString(dish?.historicNote)) fail("historicNote", "historicNote is required");
  if (!isNonEmptyString(dish?.whenEaten)) fail("whenEaten", "whenEaten is required");
  if (!Array.isArray(dish?.pairedDrink)) fail("pairedDrink", "pairedDrink must be an array");
  if (!CONFIDENCE_LEVELS.includes(dish?.confidenceLevel)) {
    fail("confidenceLevel", `confidenceLevel must be one of: ${CONFIDENCE_LEVELS.join(", ")}`);
  }

  if (!isNonEmptyString(dish?.shortDescription)) fail("shortDescription", "shortDescription is required");
  if (!isNonEmptyString(dish?.heroImage)) fail("heroImage", "heroImage is required");
  if (!CATEGORIES.includes(dish?.category)) {
    fail("category", `category must be one of: ${CATEGORIES.join(", ")}`);
  }

  if (typeof dish?.fullRecipeAvailable !== "boolean") {
    fail("fullRecipeAvailable", "fullRecipeAvailable must be a boolean");
  }

  // v2 discovery-tier enrichments — shape-checked only when present, never required.
  if (dish?.spiceLevel !== undefined && !SPICE_LEVELS.includes(dish.spiceLevel)) {
    fail("spiceLevel", `spiceLevel must be one of: ${SPICE_LEVELS.join(", ")}`);
  }
  checkOptionalArray(dish?.season, "season", fail);
  checkOptionalArray(dish?.suitableFor, "suitableFor", fail);
  if (dish?.story !== undefined && (typeof dish.story !== "object" || dish.story === null)) {
    fail("story", "story must be an object when present");
  } else if (dish?.story?.interestingFacts !== undefined) {
    checkOptionalArray(dish.story.interestingFacts, "story.interestingFacts", fail);
  }

  if (dish?.fullRecipeAvailable) {
    validateFullRecipe(dish, fail);
  }

  return issues;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateFullRecipe(dish: any, fail: (field: string, message: string) => void): void {
  if (typeof dish.baseServings !== "number" || dish.baseServings <= 0) {
    fail("baseServings", "baseServings must be a positive number when fullRecipeAvailable is true");
  }
  if (!isNonEmptyString(dish.headnote)) fail("headnote", "headnote is required for a full recipe");

  if (!Array.isArray(dish.ingredientGroups) || dish.ingredientGroups.length === 0) {
    fail("ingredientGroups", "at least one ingredient group is required");
  }

  const knownIds = new Set<string>();
  if (Array.isArray(dish.ingredientGroups)) {
    dish.ingredientGroups.forEach((group: unknown, groupIndex: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = group as any;
      if (!isNonEmptyString(g?.groupName)) {
        fail(`ingredientGroups[${groupIndex}].groupName`, "groupName is required");
      }
      if (!Array.isArray(g?.items) || g.items.length === 0) {
        fail(`ingredientGroups[${groupIndex}].items`, "at least one ingredient item is required");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      g.items.forEach((item: any, itemIndex: number) => {
        const path = `ingredientGroups[${groupIndex}].items[${itemIndex}]`;
        if (!isNonEmptyString(item?.id)) fail(`${path}.id`, "ingredient id is required");
        else knownIds.add(item.id);
        if (!isNonEmptyString(item?.name)) fail(`${path}.name`, "ingredient name is required");
        if (typeof item?.amount !== "number") fail(`${path}.amount`, "amount must be a number");
      });
    });
  }

  if (!Array.isArray(dish.steps) || dish.steps.length === 0) {
    fail("steps", "at least one step is required");
  } else {
    const stepNumbers = dish.steps.map((s: { stepNumber: unknown }) => s?.stepNumber);
    const contiguous = stepNumbers.every((n: unknown, i: number) => n === i + 1);
    if (!contiguous) {
      fail("steps", "step numbers must be contiguous starting at 1");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dish.steps.forEach((step: any, index: number) => {
      const path = `steps[${index}]`;
      if (!isNonEmptyString(step?.title)) fail(`${path}.title`, "step title is required");
      if (!isNonEmptyString(step?.instruction)) fail(`${path}.instruction`, "step instruction is required");
      if (typeof step?.durationMinutes !== "number") {
        fail(`${path}.durationMinutes`, "durationMinutes must be a number");
      }
      const refs = [...(step?.instruction ?? "").matchAll(/\{(\d{4})\}/g)] as RegExpMatchArray[];
      for (const ref of refs) {
        if (!knownIds.has(ref[1])) {
          fail(`${path}.instruction`, `references unknown ingredient id {${ref[1]}}`);
        }
      }
    });
  }

  if (!Array.isArray(dish.chefTips)) fail("chefTips", "chefTips must be an array");
  if (!isNonEmptyString(dish.donenessSummary)) fail("donenessSummary", "donenessSummary is required");
  if (!Array.isArray(dish.substitutions)) fail("substitutions", "substitutions must be an array");
  if (!Array.isArray(dish.regionalVariations)) {
    fail("regionalVariations", "regionalVariations must be an array");
  }
  if (typeof dish.nutritionEstimate !== "object" || dish.nutritionEstimate === null) {
    fail("nutritionEstimate", "nutritionEstimate is required for a full recipe");
  }

  // v2 full-recipe-tier enrichments — shape-checked only when present.
  checkOptionalArray(dish.alternativeEquipment, "alternativeEquipment", fail);
  checkOptionalArray(dish.commonMistakesSummary, "commonMistakesSummary", fail);
  checkOptionalArray(dish.recipeVariations, "recipeVariations", fail);
  checkOptionalArray(dish.faq, "faq", fail);
  checkOptionalArray(dish.preparationSteps, "preparationSteps", fail);
  checkOptionalArray(dish.chefTipCategories, "chefTipCategories", fail);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dish.recipeVariations ?? []).forEach((variation: any, index: number) => {
    if (!isNonEmptyString(variation?.type) || !isNonEmptyString(variation?.description)) {
      fail(`recipeVariations[${index}]`, "each variation needs a type and a description");
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dish.faq ?? []).forEach((item: any, index: number) => {
    if (!isNonEmptyString(item?.question) || !isNonEmptyString(item?.answer)) {
      fail(`faq[${index}]`, "each FAQ entry needs a question and an answer");
    }
  });
  if (dish.estimatedCost !== undefined) {
    if (typeof dish.estimatedCost?.costPerServing !== "number") {
      fail("estimatedCost.costPerServing", "costPerServing must be a number");
    }
    if (!isNonEmptyString(dish.estimatedCost?.currency)) {
      fail("estimatedCost.currency", "currency is required when estimatedCost is set");
    }
  }
}
