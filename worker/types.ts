export interface Env {
  GITHUB_TOKEN: string;
  SESSION_SECRET: string;
  // Shared with the Section 10 visit-counter endpoint (routes/public.ts).
  // Admin keys are "admin:"-prefixed, visit counters "visits:"-prefixed —
  // one namespace, no collision.
  ANALYTICS: KVNamespace;
}

// Mirrors lib/types/recipe.ts's DishEntry. Duplicated (not imported) because the
// worker is bundled independently of the Next.js app and does not share its
// tsconfig path aliases — this is the full Section 4 schema, kept in sync by hand.
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

export interface Dish {
  id: string;
  slug: string;
  name: string;

  country: string;
  countrySlug: string;
  continent: string;
  continentSlug: string;

  mealTime: string[];
  occasion: string[];
  streetFood: boolean;

  dietary: DietaryFlags;

  difficulty: string;
  totalTimeMinutes: number;
  historicNote: string;
  whenEaten: string;
  pairedDrink: string[];
  confidenceLevel: string;

  shortDescription: string;
  heroImage: string;

  category: string;

  fullRecipeAvailable: boolean;

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

export interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

export interface GitHubFileContent {
  content: string;
  sha: string;
}

export const REPO = "samiulAsumel/world-kitchen-atlas-data";
export const DIR = "recipes";
export const BRANCH = "main";
export const SLUG_PATTERN = /^[a-z0-9-]+$/;
