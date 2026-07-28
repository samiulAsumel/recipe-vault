export const CONTINENTS = [
  { slug: "asia", name: "Asia" },
  { slug: "europe", name: "Europe" },
  { slug: "africa", name: "Africa" },
  { slug: "americas", name: "Americas" },
  { slug: "oceania", name: "Oceania" },
] as const;

export const MEAL_TIMES = [
  { slug: "breakfast", name: "Breakfast" },
  { slug: "lunch", name: "Lunch" },
  { slug: "dinner", name: "Dinner" },
  { slug: "snacks", name: "Snacks" },
  { slug: "dessert", name: "Dessert" },
  { slug: "drinks", name: "Drinks" },
] as const;

export const OCCASIONS = [
  { slug: "street-food", name: "Street Food" },
  { slug: "festival-food", name: "Festival Food" },
] as const;

export type ContinentSlug = (typeof CONTINENTS)[number]["slug"];
