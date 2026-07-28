import type { DishEntry, IngredientGroup, RecipeStep } from "@/lib/types/recipe";

export function emptyDish(): DishEntry {
  return {
    id: "",
    slug: "",
    name: "",

    country: "",
    countrySlug: "",
    continent: "",
    continentSlug: "asia",

    mealTime: [],
    occasion: [],
    streetFood: false,

    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      eggFree: false,
      nutFree: false,
      lowCarb: false,
      highProtein: false,
    },

    difficulty: "Medium",
    totalTimeMinutes: 30,
    historicNote: "",
    whenEaten: "",
    pairedDrink: [],
    confidenceLevel: "medium",

    shortDescription: "",
    heroImage: "",

    category: "Mains",

    fullRecipeAvailable: false,
  };
}

export function emptyFullRecipeFields(): Required<
  Pick<
    DishEntry,
    | "baseServings"
    | "headnote"
    | "timing"
    | "equipment"
    | "miseEnPlace"
    | "ingredientGroups"
    | "steps"
    | "chefTips"
    | "donenessSummary"
    | "platingNote"
    | "storageNote"
    | "substitutions"
    | "regionalVariations"
    | "nutritionEstimate"
  >
> {
  return {
    baseServings: 4,
    headnote: "",
    timing: { prepMinutes: 0, marinateMinutes: 0, activeCookMinutes: 0, restMinutes: 0, totalMinutes: 0 },
    equipment: [],
    miseEnPlace: [],
    ingredientGroups: [],
    steps: [],
    chefTips: [],
    donenessSummary: "",
    platingNote: "",
    storageNote: "",
    substitutions: [],
    regionalVariations: [],
    nutritionEstimate: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  };
}

export function emptyIngredientGroup(): IngredientGroup {
  return { groupName: "", items: [] };
}

/** Next unused 4-digit ingredient id across every group — ids are never reused after a delete. */
export function nextIngredientId(ingredientGroups: IngredientGroup[]): string {
  let max = 0;
  for (const group of ingredientGroups) {
    for (const item of group.items) {
      const n = Number(item.id);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return String(max + 1).padStart(4, "0");
}

export function emptyStep(stepNumber: number): RecipeStep {
  return {
    stepNumber,
    title: "",
    instruction: "",
    durationMinutes: 0,
    heat: null,
    technique: "",
    visualCue: "",
    commonMistake: "",
  };
}
