import type { DietaryKey } from '@/lib/constants';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DietaryFlags = Record<DietaryKey, boolean>;

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
  flameNote: string;
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

export interface TimingBreakdown {
  prepMinutes: number;
  marinateMinutes: number;
  activeCookMinutes: number;
  restMinutes: number;
  totalMinutes: number;
}

export interface NutritionEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Fields present on every entry, discovery-only or full recipe alike. */
interface RecipeBase {
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

  difficulty: Difficulty;
  totalTimeMinutes: number;
  historicNote: string;
  whenEaten: string;
  pairedDrink: string[];
  confidenceLevel: ConfidenceLevel;

  shortDescription: string;
  heroImage: string;
  category: string;
}

/** Section 1 "Discovery entry" - name + origin + historic note + when-eaten + paired drink only. */
export interface DiscoveryRecipe extends RecipeBase {
  fullRecipeAvailable: false;
}

/** Section 1 "Full recipe" - discovery fields plus ingredients, steps, and everything the
 * detail-page chef-style layout (Section 5) needs. */
export interface FullRecipe extends RecipeBase {
  fullRecipeAvailable: true;

  baseServings: number;
  headnote: string;
  timing: TimingBreakdown;
  equipment: string[];
  miseEnPlace: string[];

  ingredientGroups: IngredientGroup[];
  steps: RecipeStep[];

  chefTips: string[];
  donenessSummary: string;
  platingNote: string;
  storageNote: string;
  substitutions: Substitution[];
  regionalVariations: string[];

  nutritionEstimate: NutritionEstimate;
}

/** Discriminated on `fullRecipeAvailable` so `if (recipe.fullRecipeAvailable)` narrows
 * to the fields the full-recipe detail page needs. */
export type Recipe = DiscoveryRecipe | FullRecipe;
