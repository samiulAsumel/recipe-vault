import { formatAmountWithUnit } from '@/lib/ingredient-scaling';
import type { IngredientItem } from '@/types/recipe';

export type InstructionSegment =
  | { type: 'text'; value: string }
  | { type: 'ingredient'; ingredientId: string };

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/** Section 4 step.instruction embeds ingredient references as `{0002}` placeholders (matching
 * an IngredientItem.id). Splits the instruction into plain-text and ingredient-reference
 * segments so the step card can render each reference as a live, servings-scaled inline chip. */
export function parseInstructionSegments(instruction: string): InstructionSegment[] {
  const segments: InstructionSegment[] = [];
  let lastIndex = 0;

  for (const match of instruction.matchAll(PLACEHOLDER_PATTERN)) {
    const ingredientId = match[1];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      segments.push({ type: 'text', value: instruction.slice(lastIndex, matchIndex) });
    }
    segments.push({ type: 'ingredient', ingredientId });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < instruction.length) {
    segments.push({ type: 'text', value: instruction.slice(lastIndex) });
  }

  return segments;
}

/** Plain-text version of the same resolution the step card renders live, at base (unscaled)
 * amounts - used for schema.org JSON-LD, which must match the page's default visible content. */
export function resolveInstructionText(
  instruction: string,
  ingredientsById: Map<string, IngredientItem>,
): string {
  return parseInstructionSegments(instruction)
    .map((segment) => {
      if (segment.type === 'text') return segment.value;
      const ingredient = ingredientsById.get(segment.ingredientId);
      if (!ingredient) return '';
      return `${formatAmountWithUnit(ingredient.amount, ingredient.unit)} ${ingredient.name}`;
    })
    .join('');
}
