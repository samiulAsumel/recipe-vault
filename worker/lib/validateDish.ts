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

/** Shape-only check for translations.bn (DishTranslation) — mirrors the
 * looseness of the healthInfo/story checks: every field is optional, arrays
 * are checked for being arrays, ingredientItems/steps are checked for being
 * plain keyed objects (not arrays) since they're Record<id, {...}> rather
 * than positional lists. Not exhaustive per-item validation. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateTranslations(value: any, fail: (field: string, message: string) => void): void {
  if (value === undefined) return;
  if (typeof value !== "object" || value === null) {
    fail("translations", "translations must be an object when present");
    return;
  }
  const bn = value.bn;
  if (bn === undefined) return;
  if (typeof bn !== "object" || bn === null) {
    fail("translations.bn", "translations.bn must be an object when present");
    return;
  }
  checkOptionalArray(bn.suitableFor, "translations.bn.suitableFor", fail);
  checkOptionalArray(bn.pairedDrink, "translations.bn.pairedDrink", fail);
  checkOptionalArray(bn.equipment, "translations.bn.equipment", fail);
  checkOptionalArray(bn.miseEnPlace, "translations.bn.miseEnPlace", fail);
  checkOptionalArray(bn.chefTips, "translations.bn.chefTips", fail);
  checkOptionalArray(bn.regionalVariations, "translations.bn.regionalVariations", fail);
  checkOptionalArray(bn.alternativeEquipment, "translations.bn.alternativeEquipment", fail);
  checkOptionalArray(bn.commonMistakesSummary, "translations.bn.commonMistakesSummary", fail);
  checkOptionalArray(bn.substitutions, "translations.bn.substitutions", fail);
  checkOptionalArray(bn.recipeVariations, "translations.bn.recipeVariations", fail);
  checkOptionalArray(bn.faq, "translations.bn.faq", fail);
  if (bn.story !== undefined && (typeof bn.story !== "object" || bn.story === null)) {
    fail("translations.bn.story", "must be an object when present");
  }
  if (bn.healthInfo !== undefined && (typeof bn.healthInfo !== "object" || bn.healthInfo === null)) {
    fail("translations.bn.healthInfo", "must be an object when present");
  }
  if (
    bn.servingSuggestions !== undefined &&
    (typeof bn.servingSuggestions !== "object" || bn.servingSuggestions === null)
  ) {
    fail("translations.bn.servingSuggestions", "must be an object when present");
  }
  if (bn.storageDetails !== undefined && (typeof bn.storageDetails !== "object" || bn.storageDetails === null)) {
    fail("translations.bn.storageDetails", "must be an object when present");
  }
  if (
    bn.ingredientGroupNames !== undefined &&
    (typeof bn.ingredientGroupNames !== "object" || bn.ingredientGroupNames === null || Array.isArray(bn.ingredientGroupNames))
  ) {
    fail("translations.bn.ingredientGroupNames", "must be a keyed object when present");
  }
  if (
    bn.ingredientItems !== undefined &&
    (typeof bn.ingredientItems !== "object" || bn.ingredientItems === null || Array.isArray(bn.ingredientItems))
  ) {
    fail("translations.bn.ingredientItems", "must be a keyed object when present, not an array");
  }
  if (bn.steps !== undefined && (typeof bn.steps !== "object" || bn.steps === null || Array.isArray(bn.steps))) {
    fail("translations.bn.steps", "must be a keyed object when present, not an array");
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
  validateTranslations(dish?.translations, fail);

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
  } else if (
    dish.nutritionEstimate.saturatedFatG !== undefined &&
    typeof dish.nutritionEstimate.saturatedFatG !== "number"
  ) {
    fail("nutritionEstimate.saturatedFatG", "saturatedFatG must be a number when present");
  }

  // v2 full-recipe-tier enrichments — shape-checked only when present.
  checkOptionalArray(dish.alternativeEquipment, "alternativeEquipment", fail);
  checkOptionalArray(dish.commonMistakesSummary, "commonMistakesSummary", fail);
  checkOptionalArray(dish.recipeVariations, "recipeVariations", fail);
  checkOptionalArray(dish.faq, "faq", fail);
  checkOptionalArray(dish.preparationSteps, "preparationSteps", fail);
  checkOptionalArray(dish.chefTipCategories, "chefTipCategories", fail);
  if (dish.healthInfo !== undefined && (typeof dish.healthInfo !== "object" || dish.healthInfo === null)) {
    fail("healthInfo", "healthInfo must be an object when present");
  } else {
    checkOptionalArray(dish.healthInfo?.benefits, "healthInfo.benefits", fail);
    checkOptionalArray(dish.healthInfo?.allergens, "healthInfo.allergens", fail);
    checkOptionalArray(dish.healthInfo?.dietaryConsiderations, "healthInfo.dietaryConsiderations", fail);
  }
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
