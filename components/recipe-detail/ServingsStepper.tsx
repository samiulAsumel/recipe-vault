'use client';

interface ServingsStepperProps {
  servings: number;
  onChange: (nextServings: number) => void;
  min?: number;
  max?: number;
}

const MIN_SERVINGS_DEFAULT = 1;
const MAX_SERVINGS_DEFAULT = 24;

/** Section 4: "servings stepper (e.g. `4 [-] 6 [+] 10`) ... changing it live-recalculates
 * every ingredient amount." Servings is lifted state owned by FullRecipeView; every derived
 * value (ingredient amounts, nutrition) is computed from it during render, not re-fetched. */
export function ServingsStepper({
  servings,
  onChange,
  min = MIN_SERVINGS_DEFAULT,
  max = MAX_SERVINGS_DEFAULT,
}: ServingsStepperProps): React.ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Servings</span>
      <div className="flex items-center border border-clay-line">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, servings - 1))}
          disabled={servings <= min}
          aria-label="Decrease servings"
          className="px-3 py-1.5 font-mono text-ink transition-colors hover:bg-turmeric hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-[2.5rem] px-2 text-center font-mono text-base text-ink" aria-live="polite">
          {servings}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, servings + 1))}
          disabled={servings >= max}
          aria-label="Increase servings"
          className="px-3 py-1.5 font-mono text-ink transition-colors hover:bg-turmeric hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
