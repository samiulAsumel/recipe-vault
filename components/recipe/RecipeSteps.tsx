import { buildIngredientMap, tokenizeInstruction } from "@/lib/recipe/instructions";
import { formatTemperature } from "@/lib/recipe/units";
import type { FullRecipe } from "@/lib/types/recipe";

interface RecipeStepsProps {
  dish: FullRecipe;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

export function RecipeSteps({ dish }: RecipeStepsProps): React.JSX.Element {
  const ingredientMap = buildIngredientMap(dish.ingredientGroups);

  return (
    <ol className="flex flex-col gap-6">
      {dish.steps.map((step) => {
        const tokens = tokenizeInstruction(step.instruction, ingredientMap);

        return (
          <li key={step.stepNumber} className="border border-clay-line p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-display text-lg text-ink">
                <span className="mr-2 font-meta text-sm text-ink/40">
                  {String(step.stepNumber).padStart(2, "0")}
                </span>
                {step.title}
              </h3>
              <span className="whitespace-nowrap font-meta text-xs text-ink/60">
                {formatDuration(step.durationMinutes)}
              </span>
            </div>

            {step.heat && (
              <p className="mt-1 font-meta text-xs text-paprika">
                {step.heat.level}
                {formatTemperature(step.heat.tempC) ? ` · ${formatTemperature(step.heat.tempC)}` : ""}
                {step.heat.flameNote ? ` — ${step.heat.flameNote}` : ""}
              </p>
            )}

            <p className="mt-3 font-body text-sm leading-relaxed text-ink/90">
              {tokens.map((token, index) =>
                token.type === "text" ? (
                  <span key={index}>{token.value}</span>
                ) : (
                  <strong
                    key={index}
                    className="font-medium text-ink underline decoration-clay-line decoration-2 underline-offset-2"
                  >
                    {token.item.name}
                  </strong>
                ),
              )}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <p className="border-l-2 border-cardamom pl-3 font-body text-xs text-ink/70">
                <span className="font-meta uppercase tracking-wide text-cardamom">
                  Visual cue —{" "}
                </span>
                {step.visualCue}
              </p>
              <p className="border-l-2 border-paprika pl-3 font-body text-xs text-ink/70">
                <span className="font-meta uppercase tracking-wide text-paprika">
                  Common mistake —{" "}
                </span>
                {step.commonMistake}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
