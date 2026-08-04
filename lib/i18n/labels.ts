import type { Locale } from "@/lib/i18n";
import type { Category, Difficulty, MealTime, SpiceLevel } from "@/lib/types/recipe";

/**
 * Display labels for every enum/constant value the site renders as text.
 * The underlying stored/matched values (Difficulty, SpiceLevel, MealTime,
 * Category, continent/occasion/dietary names) stay English always — they're
 * used for matching, filtering, URL params, and JSON-LD. Only what a reader
 * SEES goes through these tables. English entries are the identity mapping
 * (label === value) so callers can use the same lookup unconditionally.
 */

export const DIFFICULTY_LABELS: Record<Locale, Record<Difficulty, string>> = {
  en: { Easy: "Easy", Medium: "Medium", Hard: "Hard" },
  bn: { Easy: "সহজ", Medium: "মাঝারি", Hard: "কঠিন" },
};

export const SPICE_LEVEL_LABELS: Record<Locale, Record<SpiceLevel, string>> = {
  en: { Mild: "Mild", Medium: "Medium", Hot: "Hot", "Very Hot": "Very Hot" },
  bn: { Mild: "হালকা ঝাল", Medium: "মাঝারি ঝাল", Hot: "ঝাল", "Very Hot": "অতি ঝাল" },
};

export const MEAL_TIME_LABELS: Record<Locale, Record<MealTime, string>> = {
  en: {
    Breakfast: "Breakfast",
    Lunch: "Lunch",
    Dinner: "Dinner",
    Snacks: "Snacks",
    Dessert: "Dessert",
    Drinks: "Drinks",
  },
  bn: {
    Breakfast: "সকালের নাশতা",
    Lunch: "দুপুরের খাবার",
    Dinner: "রাতের খাবার",
    Snacks: "স্ন্যাকস",
    Dessert: "মিষ্টান্ন",
    Drinks: "পানীয়",
  },
};

export const CATEGORY_LABELS: Record<Locale, Record<Category, string>> = {
  en: {
    Mains: "Mains",
    Sides: "Sides",
    Snacks: "Snacks",
    Desserts: "Desserts",
    Drinks: "Drinks",
    Breads: "Breads",
    Soups: "Soups",
  },
  bn: {
    Mains: "প্রধান খাবার",
    Sides: "সাইড ডিশ",
    Snacks: "স্ন্যাকস",
    Desserts: "মিষ্টান্ন",
    Drinks: "পানীয়",
    Breads: "রুটি",
    Soups: "স্যুপ",
  },
};

const CONTINENT_LABELS_BN: Record<string, string> = {
  Asia: "এশিয়া",
  Europe: "ইউরোপ",
  Africa: "আফ্রিকা",
  Americas: "আমেরিকা",
  Oceania: "ওশেনিয়া",
};

// Only the countries with published recipes need an entry — an untranslated
// country not yet in this table falls back to its English name (see
// localizeCountryName below), same convention as occasion tags.
const COUNTRY_LABELS_BN: Record<string, string> = {
  Bangladesh: "বাংলাদেশ",
  India: "ভারত",
};

const OCCASION_LABELS_BN: Record<string, string> = {
  "Street Food": "স্ট্রিট ফুড",
  "Festival Food": "উৎসবের খাবার",
};

const DIETARY_LABELS_BN: Record<string, string> = {
  Vegetarian: "নিরামিষ",
  Vegan: "ভেগান",
  "Gluten-Free": "গ্লুটেন-মুক্ত",
  "Dairy-Free": "দুগ্ধ-মুক্ত",
  "Egg-Free": "ডিম-মুক্ত",
  "Nut-Free": "বাদাম-মুক্ত",
  "Low-Carb": "লো-কার্ব",
  "High-Protein": "উচ্চ-প্রোটিন",
};

/** continent.name / occasion.name / dietary flag .label from lib/constants.ts
 * are always the English value — pass it through one of these to get the
 * displayed label for a given locale. Occasion is free-form content data
 * (Section 4), so an untranslated tag not in the table falls back to itself
 * rather than showing nothing. */
export function localizeContinentName(name: string, locale: Locale): string {
  return locale === "bn" ? (CONTINENT_LABELS_BN[name] ?? name) : name;
}

export function localizeCountryName(name: string, locale: Locale): string {
  return locale === "bn" ? (COUNTRY_LABELS_BN[name] ?? name) : name;
}

export function localizeOccasionName(name: string, locale: Locale): string {
  return locale === "bn" ? (OCCASION_LABELS_BN[name] ?? name) : name;
}

export function localizeDietaryLabel(label: string, locale: Locale): string {
  return locale === "bn" ? (DIETARY_LABELS_BN[label] ?? label) : label;
}

/** "min" / "hr" — the words in formatMinutesLabel. Imperial unit words
 * (lb/oz/cup/fl oz) deliberately stay unlocalized, same convention as
 * kg/km staying Latin-script in Bengali text. */
export const DURATION_UNIT_LABELS: Record<Locale, { min: string; hr: string }> = {
  en: { min: "min", hr: "hr" },
  bn: { min: "মিনিট", hr: "ঘণ্টা" },
};
