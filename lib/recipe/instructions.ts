import type { DishTranslation, IngredientGroup, IngredientItem } from "@/lib/types/recipe";

export function buildIngredientMap(groups: IngredientGroup[]): Map<string, IngredientItem> {
  const map = new Map<string, IngredientItem>();
  for (const group of groups) {
    for (const item of group.items) {
      map.set(item.id, item);
    }
  }
  return map;
}

/** Substitutes each ingredient's translated name/unit/prepNote (keyed by
 * IngredientItem.id in translations.bn.ingredientItems) over the English
 * groups, so every downstream consumer — the ingredient list, the inline
 * {id} references inside step instructions, Cook Mode — shows the same
 * translated name rather than each re-deriving it separately. Falls back to
 * the English field per-item when a specific ingredient isn't translated
 * yet. */
export function applyIngredientTranslations(
  groups: IngredientGroup[],
  translation: DishTranslation | undefined,
): IngredientGroup[] {
  if (!translation) return groups;
  return groups.map((group) => ({
    groupName: translation.ingredientGroupNames?.[group.groupName] ?? group.groupName,
    items: group.items.map((item) => {
      const t = translation.ingredientItems?.[item.id];
      if (!t) return item;
      return {
        ...item,
        name: t.name ?? item.name,
        unit: t.unit ?? item.unit,
        prepNote: t.prepNote ?? item.prepNote,
        alternatives: t.alternatives ?? item.alternatives,
      };
    }),
  }));
}

export type InstructionToken =
  | { type: "text"; value: string }
  | { type: "ingredient"; item: IngredientItem };

const REFERENCE_PATTERN = /\{(\w+)\}/g;

/**
 * Splits step instruction text on {id} placeholders, resolving each against
 * the dish's ingredient map. An unresolved id (data error) is left as plain
 * text rather than dropped, so a bad reference is visible instead of silent.
 */
export function tokenizeInstruction(
  text: string,
  ingredientMap: Map<string, IngredientItem>,
): InstructionToken[] {
  const tokens: InstructionToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(REFERENCE_PATTERN)) {
    const [placeholder, id] = match;
    const matchIndex = match.index;
    const item = ingredientMap.get(id);

    if (!item) continue;

    if (matchIndex > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, matchIndex) });
    }
    tokens.push({ type: "ingredient", item });
    lastIndex = matchIndex + placeholder.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens;
}

/** Plain-text resolution for contexts that can't render JSX (e.g. JSON-LD). */
export function resolveInstructionText(
  text: string,
  ingredientMap: Map<string, IngredientItem>,
): string {
  return tokenizeInstruction(text, ingredientMap)
    .map((token) => (token.type === "text" ? token.value : token.item.name))
    .join("");
}
