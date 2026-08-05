import type { Locale } from "@/lib/i18n";
import type { DishEntry, Substitution } from "@/lib/types/recipe";

export interface SubstitutionEntry {
  original: string;
  swap: string;
  /** null for entries sourced from IngredientItem.alternatives, which carry
   * no impact note — only the dish-level substitutions[] does. */
  impact: string | null;
  dish: DishEntry;
}

export interface SubstitutionGroup {
  /** Normalized grouping key — not for display. */
  key: string;
  /** Richest original label seen across the group's entries. */
  original: string;
  entries: SubstitutionEntry[];
}

/**
 * `original` is free text, not a canonical ingredient id (no ingredient
 * dictionary exists in this schema) — strip a trailing parenthetical and
 * anything after the first comma so e.g. "date-palm jaggery (khejur gur)"
 * and "mutton, bone-in curry-cut" group with their bare forms.
 */
function normalizeIngredientKey(name: string): string {
  return name.split(",")[0].split("(")[0].trim().toLowerCase();
}

function resolveTranslatedSubstitutions(dish: DishEntry, locale: Locale): Substitution[] {
  const substitutions = dish.substitutions ?? [];
  if (locale !== "bn") return substitutions;
  const translated = dish.translations?.bn?.substitutions;
  // Bengali substitutions are a full parallel array (no stable per-entry id
  // to key by) — only trust it when the length matches, same guard the dish
  // page itself uses, otherwise fall back to English rather than desyncing.
  return translated && translated.length === substitutions.length ? translated : substitutions;
}

function addEntry(
  groups: Map<string, SubstitutionGroup>,
  displayLabel: string,
  entry: SubstitutionEntry,
): void {
  const key = normalizeIngredientKey(displayLabel);
  let group = groups.get(key);
  if (!group) {
    group = { key, original: displayLabel, entries: [] };
    groups.set(key, group);
  } else if (displayLabel.length > group.original.length) {
    group.original = displayLabel;
  }
  group.entries.push(entry);
}

/**
 * Flattens every dish's substitutions[] (primary source, 100% dish coverage)
 * and IngredientItem.alternatives (secondary, Bangladesh-only, no impact
 * note) into ingredient-keyed groups for the site-wide substitution search.
 */
export function buildSubstitutionIndex(dishes: DishEntry[], locale: Locale): SubstitutionGroup[] {
  const groups = new Map<string, SubstitutionGroup>();

  for (const dish of dishes) {
    for (const sub of resolveTranslatedSubstitutions(dish, locale)) {
      addEntry(groups, sub.original, {
        original: sub.original,
        swap: sub.swap,
        impact: sub.impact,
        dish,
      });
    }

    for (const group of dish.ingredientGroups ?? []) {
      for (const item of group.items) {
        for (const alternative of item.alternatives ?? []) {
          addEntry(groups, item.name, {
            original: item.name,
            swap: alternative,
            impact: null,
            dish,
          });
        }
      }
    }
  }

  return [...groups.values()].sort((a, b) => {
    if (b.entries.length !== a.entries.length) return b.entries.length - a.entries.length;
    return a.original.localeCompare(b.original);
  });
}
