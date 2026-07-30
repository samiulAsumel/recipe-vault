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
  localName?: string;
  scientificName?: string;
  image?: string;
  alternatives?: string[];
  purpose?: string;
  storageTips?: string;
  optional?: boolean;
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
  image?: string;
  professionalTip?: string;
  warning?: string;
}

export interface Substitution {
  original: string;
  swap: string;
  impact: string;
  flavorDifference?: string;
  textureDifference?: string;
  quantityAdjustment?: string;
}

export interface NutritionEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  potassiumMg?: number;
  ironMg?: number;
  calciumMg?: number;
  vitaminAMcg?: number;
  vitaminCMg?: number;
  vitaminDMcg?: number;
  cholesterolMg?: number;
}

/** Story/history section — a deeper optional layer on top of the always-present
 * historicNote/whenEaten fields, not a replacement for them. */
export interface Story {
  history?: string;
  origin?: string;
  culturalSignificance?: string;
  traditionalBackground?: string;
  interestingFacts?: string[];
}

export interface Gallery {
  finishedDish?: string[];
  ingredients?: string[];
  preparation?: string[];
  cookingSteps?: string[];
  servingStyle?: string[];
  traditionalPresentation?: string[];
}

export type SpiceLevel = "Mild" | "Medium" | "Hot" | "Very Hot";

/** Stored per-serving — costPerServing is the base metric; scaleCost() derives a
 * total for any target serving count rather than storing two numbers that could drift. */
export interface EstimatedCost {
  costPerServing: number;
  currency: string;
  countryContext?: string;
}

export interface StorageDetails {
  refrigerator?: string;
  freezer?: string;
  shelfLife?: string;
  reheatingInstructions?: string;
  foodSafetyNotes?: string;
  freezerFriendly?: boolean;
}

export interface ServingSuggestions {
  rice?: string[];
  bread?: string[];
  sideDish?: string[];
  salad?: string[];
  drinks?: string[];
  desserts?: string[];
  sauces?: string[];
}

/** v3 standard Section 17 — informational only, never medical advice.
 * Allergens are named per the broader of the EU/UK Annex II 14 and the
 * US FDA "Big 9", so mustard and coconut are always listed when present. */
export interface HealthInfo {
  benefits?: string[];
  allergens?: string[];
  dietaryConsiderations?: string[];
}

export interface RecipeVariation {
  type: string;
  description: string;
}

export interface PreparationStep {
  category: string;
  instruction: string;
}

export interface ChefTipCategory {
  category: string;
  tip: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Per-language override of the dish's free-text fields. Only translatable
 * prose lives here — structural/enum/numeric fields (id, dietary, timing,
 * nutritionEstimate, etc.) never change between languages, so they are never
 * duplicated into a translation. Nested arrays that mix structural and
 * translatable data are keyed by the array item's existing stable id rather
 * than position, so a translation never desyncs if the English array is
 * reordered: ingredientItems by IngredientItem.id, steps by
 * RecipeStep.stepNumber. Arrays with no existing stable id (faq,
 * substitutions, recipeVariations) are a full parallel array, expected to be
 * the same length as the English one. */
export interface DishTranslation {
  name?: string;
  historicNote?: string;
  whenEaten?: string;
  shortDescription?: string;
  region?: string;
  cuisine?: string;
  cookingMethod?: string;
  suitableFor?: string[];
  /** Display label only — the underlying English pairedDrink[] values remain
   * the match key used to link to another dish's page (see lib/data/pairedDrink.ts). */
  pairedDrink?: string[];
  headnote?: string;
  equipment?: string[];
  miseEnPlace?: string[];
  chefTips?: string[];
  donenessSummary?: string;
  platingNote?: string;
  storageNote?: string;
  regionalVariations?: string[];
  alternativeEquipment?: string[];
  commonMistakesSummary?: string[];
  story?: Story;
  healthInfo?: HealthInfo;
  servingSuggestions?: ServingSuggestions;
  storageDetails?: Pick<
    StorageDetails,
    "refrigerator" | "freezer" | "shelfLife" | "reheatingInstructions" | "foodSafetyNotes"
  >;
  /** Keyed by IngredientGroup.groupName (English) -> translated group name. */
  ingredientGroupNames?: Record<string, string>;
  /** Keyed by IngredientItem.id, e.g. "0001". */
  ingredientItems?: Record<
    string,
    { name?: string; unit?: string; prepNote?: string; alternatives?: string[] }
  >;
  /** Keyed by RecipeStep.stepNumber. */
  steps?: Record<
    number,
    {
      title?: string;
      instruction?: string;
      technique?: string;
      visualCue?: string;
      commonMistake?: string;
    }
  >;
  substitutions?: Substitution[];
  recipeVariations?: RecipeVariation[];
  faq?: FaqItem[];
}

export interface Translations {
  bn?: DishTranslation;
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

  // v2 discovery-tier enrichments — optional on every entry, full recipe or not,
  // since a discovery-only entry can still have a native name, region, cuisine
  // tag, or a deeper story even without full cooking steps.
  nativeName?: string;
  region?: string;
  regionSlug?: string;
  cuisine?: string;
  cuisineSlug?: string;
  cookingMethod?: string;
  spiceLevel?: SpiceLevel;
  season?: string[];
  suitableFor?: string[];
  story?: Story;

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

  // v2 full-recipe-tier enrichments — optional additive siblings of the fields
  // above, not replacements (e.g. storageDetails sits alongside storageNote).
  gallery?: Gallery;
  alternativeEquipment?: string[];
  preparationSteps?: PreparationStep[];
  chefTipCategories?: ChefTipCategory[];
  commonMistakesSummary?: string[];
  estimatedCost?: EstimatedCost;
  storageDetails?: StorageDetails;
  servingSuggestions?: ServingSuggestions;
  recipeVariations?: RecipeVariation[];
  faq?: FaqItem[];
  healthInfo?: HealthInfo;
  translations?: Translations;
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
