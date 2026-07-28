import type { ContinentSlug } from "@/lib/constants";

export type MealTime = "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Dessert" | "Drinks";

export type Occasion = "Street Food" | "Festival Food" | "Wedding" | "Eid" | string;

export type Difficulty = "Easy" | "Medium" | "Hard";

export type ConfidenceLevel = "high" | "medium" | "low";

export type Category = "Mains" | "Sides" | "Snacks" | "Desserts" | "Drinks" | "Breads" | "Soups";

export interface DietaryFlags {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  eggFree: boolean;
  nutFree: boolean;
  lowCarb: boolean;
  highProtein: boolean;
}

export interface Timing {
  prepMinutes: number;
  marinateMinutes: number;
  activeCookMinutes: number;
  restMinutes: number;
  totalMinutes: number;
}

export interface IngredientItem {
  id: string;
  name: string;
  amount: number;
  unit: string | null;
  prepNote: string | null;
  pantryStaple: boolean;
}

export interface IngredientGroup {
  groupName: string;
  items: IngredientItem[];
}

export interface StepHeat {
  level: string;
  flameNote: string | null;
  tempC: number | null;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationMinutes: number;
  heat: StepHeat | null;
  technique: string;
  visualCue: string;
  commonMistake: string;
}

export interface Substitution {
  original: string;
  swap: string;
  impact: string;
}

export interface NutritionEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Discovery-tier fields — present on every entry, full recipe or not. */
export interface DishEntry {
  id: string;
  slug: string;
  name: string;

  country: string;
  countrySlug: string;
  continent: string;
  continentSlug: ContinentSlug;

  mealTime: MealTime[];
  occasion: Occasion[];
  streetFood: boolean;

  dietary: DietaryFlags;

  difficulty: Difficulty;
  totalTimeMinutes: number;
  historicNote: string;
  whenEaten: string;
  pairedDrink: string[];
  confidenceLevel: ConfidenceLevel;

  shortDescription: string;
  heroImage: string;

  category: Category;

  fullRecipeAvailable: boolean;

  // Full-recipe fields — present only when fullRecipeAvailable is true.
  // Use isFullRecipe() to narrow rather than casting.
  baseServings?: number;
  headnote?: string;
  timing?: Timing;
  equipment?: string[];
  miseEnPlace?: string[];
  ingredientGroups?: IngredientGroup[];
  steps?: RecipeStep[];
  chefTips?: string[];
  donenessSummary?: string;
  platingNote?: string;
  storageNote?: string;
  substitutions?: Substitution[];
  regionalVariations?: string[];
  nutritionEstimate?: NutritionEstimate;
}

/** A DishEntry narrowed to guarantee its full-recipe fields are present. */
export type FullRecipe = DishEntry &
  Required<
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
  >;

export function isFullRecipe(entry: DishEntry): entry is FullRecipe {
  return (
    entry.fullRecipeAvailable &&
    entry.baseServings !== undefined &&
    entry.ingredientGroups !== undefined &&
    entry.steps !== undefined
  );
}

export interface CountrySummary {
  slug: string;
  name: string;
  continentSlug: ContinentSlug;
  dishCount: number;
}
