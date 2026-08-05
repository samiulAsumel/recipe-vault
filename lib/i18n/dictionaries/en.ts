/** English dictionary — the source of truth for every hardcoded UI string on
 * the site. Every string here is the EXACT current site text, unchanged; this
 * file just gives it one name so lib/i18n/dictionaries/bn.ts can be checked
 * against the same shape. */
export const en = {
  site: {
    name: "World Kitchen Atlas",
    description:
      "A global culinary encyclopedia organized by continent, country, and dish — with history, occasion, and traditional drink pairings for every entry.",
  },
  nav: {
    search: "Search",
    about: "About",
    continents: "Continents",
    browse: "Browse",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLanguage: "Switch language",
  },
  footer: {
    copyright: (year: number) =>
      `© ${year} World Kitchen Atlas. All content is original; unauthorized reproduction is prohibited.`,
  },
  home: {
    title: "World Kitchen Atlas",
    heroParagraph:
      "A global culinary encyclopedia — continent, country, and dish — with the history, occasion, and traditional drink pairing behind every entry.",
    exploreByContinent: "Explore by continent",
    browseByMealTime: "Browse by meal time",
    countryCount: (n: number): string => (n === 1 ? "country" : "countries"),
    dishCount: (n: number): string => (n === 1 ? "dish" : "dishes"),
    comingSoonLabel: "Coming soon",
  },
  notFound: {
    title: "404",
    description: "This page doesn't exist in the atlas yet.",
  },
  about: {
    metaTitle: "About",
    metaDescription:
      "World Kitchen Atlas's methodology and accuracy disclaimer — how dishes are researched, sourced, and confidence-rated.",
    heading: "About",
    whatThisIs: {
      heading: "What this is",
      body: "World Kitchen Atlas aims for a real baseline of dishes for every country — main courses, street food, desserts, breads, and traditional drinks — organized by continent and country so a dish can always be traced back to where it actually comes from.",
    },
    coverageVaries: {
      heading: "Coverage varies by country, honestly",
      body: "Large, well-documented cuisines — India, China, Italy, France, Bangladesh, Japan, Mexico, Turkey, and others — get deep, confident coverage, often well beyond the baseline. Some very small nations (Pacific micro-states, or city-states like Vatican City, Liechtenstein, Monaco, San Marino) don't have that many distinctly documented dishes to draw from. For those, this atlas lists what can genuinely be confirmed and says so plainly, rather than padding the count with invented or generic filler.",
    },
    noInvented: {
      heading: "No invented dishes, no false precision",
      body: "Every dish on this site is real — none are invented to round out a list. Where a dish's exact year of origin isn't certain (which is common for food history), the entry reflects general culinary consensus rather than asserting a precise date as fact.",
    },
    confidenceLevels: {
      heading: "Confidence levels",
      body: "Every entry carries a confidence rating — shown as the tick marks on its Atlas Pin badge — reflecting how well-documented that dish's history and details are: three ticks for high confidence, down to one for entries built from thinner sourcing. It's a deliberate part of the design, not an afterthought: this atlas would rather show its uncertainty than hide it.",
    },
    somethingInaccurate: {
      heading: "Something inaccurate?",
      body: "If a dish, origin, or historic note here looks wrong, it's worth flagging — this atlas is a work in progress, not a finished, authoritative record.",
    },
  },
  search: {
    metaTitle: "Search",
    metaDescription:
      "Search every documented dish by name, country, or description, with continent, meal-time, dietary, and occasion filters.",
    heading: "Search",
    srLabel: "Search dishes, countries, or ingredients",
    placeholder: "Search dishes, countries, or ingredients…",
    submit: "Search",
    noResultsForQuery: (q: string) => `No dishes match "${q}".`,
    noResultsFilters: "No dishes match these filters.",
  },
  submitRecipe: {
    metaTitle: "Submit a Recipe",
    metaDescription: "Share a dish for World Kitchen Atlas to research and add.",
    title: "Submit a Recipe",
    description: "Recipe submission form comes here.",
  },
  mealHubs: {
    breakfast: { title: "Breakfast", description: "Breakfast dishes from every documented country, with dietary and occasion filters.", emptyMessage: "No breakfast dishes documented yet." },
    lunch: { title: "Lunch", description: "Lunch dishes from every documented country, with dietary and occasion filters.", emptyMessage: "No lunch dishes documented yet." },
    dinner: { title: "Dinner", description: "Dinner dishes from every documented country, with dietary and occasion filters.", emptyMessage: "No dinner dishes documented yet." },
    snacks: { title: "Snacks", description: "Snack dishes from every documented country, with dietary and occasion filters.", emptyMessage: "No snack dishes documented yet." },
    dessert: { title: "Dessert", description: "Dessert dishes from every documented country, with dietary and occasion filters.", emptyMessage: "No dessert dishes documented yet." },
    drinks: { title: "Drinks", description: "Drink dishes from every documented country, with dietary and occasion filters.", emptyMessage: "No drink dishes documented yet." },
    streetFood: { title: "Street Food", description: "Street-food dishes from every documented country, with dietary and meal-time filters.", emptyMessage: "No street-food dishes documented yet." },
    festivalFood: { title: "Festival Food", description: "Festival dishes from every documented country, with dietary and meal-time filters.", emptyMessage: "No festival dishes documented yet." },
  },
  continent: {
    metaDescription: (name: string) => `Countries and dishes from ${name}, part of the World Kitchen Atlas.`,
    noCountries: (name: string) => `No countries documented for ${name} yet.`,
    dishCount: (n: number): string => (n === 1 ? "dish" : "dishes"),
  },
  country: {
    metaDescription: (dishCount: number, name: string) =>
      `${dishCount} dish ${dishCount === 1 ? "entry" : "entries"} from ${name} — history, occasion, and traditional drink pairings.`,
    emptyMessage: "No dishes match these filters.",
    traditionalDrinks: "Traditional Drinks",
  },
  dish: {
    equipment: "Equipment",
    miseEnPlace: "Mise en place",
    doneness: "Doneness",
    plating: "Plating",
    storage: "Storage",
    chefTips: "Chef's tips",
    substitutions: "Substitutions",
    regionalVariations: "Regional variations",
    pairedDrink: "Paired drink",
  },
  discoveryDetail: {
    history: "History",
    whenEaten: "When it's eaten",
    pairedDrink: "Paired drink",
    comingSoon: "Full recipe coming soon.",
  },
  filters: {
    continent: "Continent",
    dietary: "Dietary",
    mealTime: "Meal time",
    occasion: "Occasion",
    clearAll: "Clear all filters",
    clearOccasion: "Clear occasion filters",
    occasionSearchPlaceholder: "Search occasions…",
    occasionNoMatches: "No occasions match your search.",
  },
  dishGrid: {
    emptyDefault: "No dishes match yet.",
  },
  dishCard: {
    fullRecipe: "Full recipe",
    discoveryEntry: "Discovery entry",
  },
  confidence: {
    high: "Verified",
    medium: "Likely",
    low: "Unverified",
    ariaLabel: (level: string) => `Confidence: ${level}`,
  },
  recipeSummary: {
    difficulty: "Difficulty",
    totalTime: "Total time",
    spiceLevel: "Spice level",
    bestFor: "Best for",
    dietary: "Dietary",
  },
  servingsIngredients: {
    servings: "Servings",
    decreaseServings: "Decrease servings",
    increaseServings: "Increase servings",
    resetTo: (n: number) => `Reset to ${n}`,
    nutritionHeading: "Nutrition (per serving batch)",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    satFat: "Sat. fat",
  },
  recipeSteps: {
    visualCue: "Visual cue — ",
    commonMistake: "Common mistake — ",
  },
  recipeStory: {
    history: "History",
    origin: "Origin",
    culturalSignificance: "Cultural significance",
    traditionalBackground: "Traditional background",
    heading: "Story",
    interestingFacts: "Interesting facts",
  },
  healthInformation: {
    disclaimer:
      "Informational only, not medical or dietary advice. Nutrition values are approximate and vary by brand and preparation.",
    heading: "Health information",
    benefits: "Benefits",
    allergens: "Allergens",
    dietaryConsiderations: "Dietary considerations",
  },
  cookMode: {
    startCooking: "Start cooking",
    timerDoneAnnouncement: (title: string) => `Timer for ${title} is done.`,
    miseEnPlace: "Mise en place",
    stepAnnouncement: (current: number, total: number, title: string) =>
      `Step ${current} of ${total}: ${title}`,
    ariaLabel: (dishName: string) => `Cook Mode — ${dishName}`,
    stepStatus: (current: number, total: number) => `Step ${current} / ${total}`,
    servings: "Servings",
    decreaseServings: "Decrease servings",
    increaseServings: "Increase servings",
    close: "Close",
    stepsAriaLabel: "Steps",
    previous: "Previous",
    finish: "Finish",
    next: "Next",
    markStepDone: "Mark step done",
  },
  stepTimer: {
    readyAt: (time: string) => `Ready at ${time}`,
    timerDone: "Timer done",
    start: "Start",
    pause: "Pause",
    addMinute: "+1 min",
    resume: "Resume",
    reset: "Reset",
  },
};

export type Dictionary = typeof en;
