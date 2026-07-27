import { formatAmountWithUnit, formatDurationMinutes, scaleIngredientAmount } from '@/lib/ingredient-scaling';
import { parseInstructionSegments } from '@/lib/ingredient-references';
import type { IngredientItem, RecipeStep } from '@/types/recipe';

interface StepCardProps {
  step: RecipeStep;
  ingredientsById: Map<string, IngredientItem>;
  baseServings: number;
  servings: number;
}

/** Section 5: each step card shows the instruction (with inline, servings-scaled ingredient
 * references), a heat badge, a timer chip, a visual-cue callout, and a common-mistake callout. */
export function StepCard({ step, ingredientsById, baseServings, servings }: StepCardProps): React.ReactElement {
  const segments = parseInstructionSegments(step.instruction);

  return (
    <li className="border border-clay-line p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg text-ink">
          <span className="font-mono text-sm text-ink/50">{step.stepNumber}.</span> {step.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {step.heat ? (
            <span className="border border-paprika px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-paprika">
              {step.heat.level}
              {step.heat.tempC ? ` · ${step.heat.tempC}°C` : ''}
            </span>
          ) : null}
          <span className="border border-clay-line px-2 py-0.5 font-mono text-xs text-ink/70">
            {formatDurationMinutes(step.durationMinutes)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink">
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <span key={`text-${index}-${segment.value}`}>{segment.value}</span>;
          }
          const ingredient = ingredientsById.get(segment.ingredientId);
          if (!ingredient) return null;
          const scaledAmount = scaleIngredientAmount(
            ingredient.amount,
            baseServings,
            servings,
            ingredient.unit,
          );
          return (
            <strong key={`ingredient-${index}-${segment.ingredientId}`} className="font-semibold text-[var(--accent-1)]">
              {formatAmountWithUnit(scaledAmount, ingredient.unit)} {ingredient.name}
            </strong>
          );
        })}
      </p>

      {step.heat?.flameNote ? <p className="mt-2 text-xs text-ink/60">{step.heat.flameNote}</p> : null}

      <div className="mt-4 flex flex-col gap-2">
        <p className="border-l-2 border-cardamom pl-3 text-sm text-ink/70">
          <span className="font-mono text-xs uppercase tracking-widest text-cardamom">Visual cue </span>
          {step.visualCue}
        </p>
        <p className="border-l-2 border-paprika pl-3 text-sm text-ink/70">
          <span className="font-mono text-xs uppercase tracking-widest text-paprika">Common mistake </span>
          {step.commonMistake}
        </p>
      </div>
    </li>
  );
}
