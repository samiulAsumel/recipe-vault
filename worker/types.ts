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
