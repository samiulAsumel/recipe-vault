import type { IngredientGroup, IngredientItem } from "@/lib/types/recipe";

export function buildIngredientMap(groups: IngredientGroup[]): Map<string, IngredientItem> {
  const map = new Map<string, IngredientItem>();
  for (const group of groups) {
    for (const item of group.items) {
      map.set(item.id, item);
    }
  }
  return map;
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
