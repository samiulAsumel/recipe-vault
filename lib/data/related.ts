import type { DietaryFlags, DishEntry } from "@/lib/types/recipe";

/**
 * Weights validated against the real 116-dish dataset (see the "You Might
 * Also Like" plan). Ingredient overlap alone is not viable — with pantry
 * staples excluded, dishes like Masala Chai share zero ingredients with
 * anything else in the database — so the categorical signals below are load-
 * bearing, not decoration: they're what guarantees every dish gets sensible
 * neighbours.
 */
const WEIGHTS = {
  ingredient: 3.0,
  category: 2.0,
  cuisine: 1.5,
  mealTime: 1.0,
  country: 0.75,
  streetFood: 0.5,
  dietary: 0.5,
  occasion: 0.4,
  spiceLevel: 0.4,
};

interface SimilarityIndex {
  ingredientSets: Map<string, Set<string>>;
  idf: Map<string, number>;
}

// Keyed by array identity — getAllDishes() memoizes one array per build, so
// this table is computed once and reused across every dish page.
const indexCache = new WeakMap<DishEntry[], SimilarityIndex>();

function normalizeIngredientName(name: string): string {
  return name.split(",")[0].split("(")[0].trim().toLowerCase();
}

function extractIngredientNames(dish: DishEntry): Set<string> {
  const names = new Set<string>();
  for (const group of dish.ingredientGroups ?? []) {
    for (const item of group.items) {
      // Pantry staples (salt, water, onion...) appear in nearly every dish
      // and would dominate the score, making everything look equally
      // similar — only a dish's distinctive ingredients should count.
      if (item.pantryStaple) continue;
      names.add(normalizeIngredientName(item.name));
    }
  }
  return names;
}

function buildSimilarityIndex(dishes: DishEntry[]): SimilarityIndex {
  const ingredientSets = new Map<string, Set<string>>();
  const documentFrequency = new Map<string, number>();

  for (const dish of dishes) {
    const names = extractIngredientNames(dish);
    ingredientSets.set(dish.id, names);
    for (const name of names) {
      documentFrequency.set(name, (documentFrequency.get(name) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [name, frequency] of documentFrequency) {
    idf.set(name, Math.log(dishes.length / (1 + frequency)));
  }

  return { ingredientSets, idf };
}

function getSimilarityIndex(dishes: DishEntry[]): SimilarityIndex {
  let index = indexCache.get(dishes);
  if (!index) {
    index = buildSimilarityIndex(dishes);
    indexCache.set(dishes, index);
  }
  return index;
}

function ingredientSimilarity(a: DishEntry, b: DishEntry, index: SimilarityIndex): number {
  const setA = index.ingredientSets.get(a.id) ?? new Set<string>();
  const setB = index.ingredientSets.get(b.id) ?? new Set<string>();

  let intersectionWeight = 0;
  for (const name of setA) {
    if (setB.has(name)) intersectionWeight += index.idf.get(name) ?? 0;
  }
  if (intersectionWeight === 0) return 0;

  const weightSum = (names: Set<string>): number =>
    [...names].reduce((sum, name) => sum + (index.idf.get(name) ?? 0), 0);
  const denominator = Math.sqrt(weightSum(setA)) * Math.sqrt(weightSum(setB));
  return denominator === 0 ? 0 : intersectionWeight / denominator;
}

function intersectionSize<T>(a: Set<T>, b: Set<T>): number {
  let count = 0;
  for (const item of a) if (b.has(item)) count++;
  return count;
}

function cuisineTokens(dish: DishEntry): Set<string> {
  const cuisine = dish.cuisine ?? "";
  return new Set(
    cuisine
      .toLowerCase()
      .replace(/[/()]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3),
  );
}

function mealTimeOverlapRatio(a: DishEntry, b: DishEntry): number {
  if (a.mealTime.length === 0) return 0;
  const bSet = new Set(b.mealTime);
  const shared = a.mealTime.filter((meal) => bSet.has(meal)).length;
  return shared / a.mealTime.length;
}

function occasionOverlapScore(a: DishEntry, b: DishEntry): number {
  const bSet = new Set(b.occasion);
  const shared = a.occasion.filter((tag) => bSet.has(tag)).length;
  return Math.min(shared, 2) / 2;
}

function sharedDietaryRatio(a: DietaryFlags, b: DietaryFlags): number {
  const keys = Object.keys(a) as Array<keyof DietaryFlags>;
  const shared = keys.filter((key) => a[key] && b[key]).length;
  return shared / keys.length;
}

function computeScore(a: DishEntry, b: DishEntry, index: SimilarityIndex): number {
  let score = WEIGHTS.ingredient * ingredientSimilarity(a, b, index);

  if (a.category === b.category) score += WEIGHTS.category;

  const sharedCuisineTokens = intersectionSize(cuisineTokens(a), cuisineTokens(b));
  score += WEIGHTS.cuisine * (Math.min(sharedCuisineTokens, 2) / 2);

  score += WEIGHTS.mealTime * mealTimeOverlapRatio(a, b);

  if (a.countrySlug === b.countrySlug) score += WEIGHTS.country;
  if (a.streetFood && b.streetFood) score += WEIGHTS.streetFood;

  score += WEIGHTS.dietary * sharedDietaryRatio(a.dietary, b.dietary);
  score += WEIGHTS.occasion * occasionOverlapScore(a, b);

  if (a.spiceLevel && a.spiceLevel === b.spiceLevel) score += WEIGHTS.spiceLevel;

  return score;
}

/**
 * Content-based "You Might Also Like" candidates for `dish`, ranked by a
 * hybrid score (ingredient overlap + category/cuisine/meal-time/country/
 * dietary/occasion/spice signals). Pure function of the current dish
 * database — no external behavior signal, no extra data fetching beyond
 * `allDishes`, which every caller already has in scope.
 */
export function getRelatedDishes(dish: DishEntry, allDishes: DishEntry[], limit = 4): DishEntry[] {
  const index = getSimilarityIndex(allDishes);

  return allDishes
    .filter((candidate) => candidate.id !== dish.id)
    .map((candidate) => ({ candidate, score: computeScore(dish, candidate, index) }))
    .filter((scored) => scored.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((scored) => scored.candidate);
}
