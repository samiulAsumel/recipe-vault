export const CONTINENT_SLUGS = ['asia', 'europe', 'africa', 'americas', 'oceania'] as const;
export type ContinentSlug = (typeof CONTINENT_SLUGS)[number];

export function isContinentSlug(value: string): value is ContinentSlug {
  return (CONTINENT_SLUGS as readonly string[]).includes(value);
}

export const CONTINENT_LABELS: Record<ContinentSlug, string> = {
  asia: 'Asia',
  europe: 'Europe',
  africa: 'Africa',
  americas: 'Americas',
  oceania: 'Oceania',
};

export const MEAL_TIME_SLUGS = ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert', 'drinks'] as const;
export type MealTimeSlug = (typeof MEAL_TIME_SLUGS)[number];

export const MEAL_TIME_LABELS: Record<MealTimeSlug, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  dessert: 'Dessert',
  drinks: 'Drinks',
};

export const OCCASION_HUB_SLUGS = ['street-food', 'festival-food'] as const;
export type OccasionHubSlug = (typeof OCCASION_HUB_SLUGS)[number];

export const OCCASION_HUB_LABELS: Record<OccasionHubSlug, string> = {
  'street-food': 'Street Food',
  'festival-food': 'Festival Food',
};

export const DIETARY_KEYS = [
  'vegetarian',
  'vegan',
  'glutenFree',
  'dairyFree',
  'eggFree',
  'nutFree',
  'lowCarb',
  'highProtein',
] as const;
export type DietaryKey = (typeof DIETARY_KEYS)[number];

export const DIETARY_LABELS: Record<DietaryKey, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten-Free',
  dairyFree: 'Dairy-Free',
  eggFree: 'Egg-Free',
  nutFree: 'Nut-Free',
  lowCarb: 'Low-Carb',
  highProtein: 'High-Protein',
};
