import { getDictionary, type Locale } from "@/lib/i18n";
import { applyIngredientTranslations, buildIngredientMap, tokenizeInstruction } from "@/lib/recipe/instructions";
import { formatMinutesLabel } from "@/lib/recipe/timers";
import { formatTemperature } from "@/lib/recipe/units";
import type { FullRecipe } from "@/lib/types/recipe";

interface RecipeStepsProps {
  dish: FullRecipe;
  locale?: Locale;
}

export function RecipeSteps({ dish, locale = "en" }: RecipeStepsProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const bn = locale === "bn" ? dish.translations?.bn : undefined;
  const ingredientGroups = applyIngredientTranslations(dish.ingredientGroups, bn);
  const ingredientMap = buildIngredientMap(ingredientGroups);

  return (
    <ol className="flex flex-col gap-6">
      {dish.steps.map((step) => {
        const tokens = tokenizeInstruction(step.instruction, ingredientMap);
        const translatedStep = bn?.steps?.[step.stepNumber];
        const title = translatedStep?.title ?? step.title;
        const visualCue = translatedStep?.visualCue ?? step.visualCue;
        const commonMistake = translatedStep?.commonMistake ?? step.commonMistake;
        const heatLevel = translatedStep?.heat?.level ?? step.heat?.level;
        const heatFlameNote = translatedStep?.heat?.flameNote ?? step.heat?.flameNote;

        return (
          <li key={step.stepNumber} className="rounded-[var(--radius-card)] border border-clay-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-display text-lg text-ink">
                <span className="mr-2 font-meta text-sm text-ink/40">
                  {String(step.stepNumber).padStart(2, "0")}
                </span>
                {title}
              </h3>
              <span className="whitespace-nowrap font-meta text-xs text-ink/60">
                {formatMinutesLabel(step.durationMinutes, locale)}
              </span>
            </div>

            {step.heat && (
              <p className="mt-1 font-meta text-xs text-paprika">
                {heatLevel}
                {formatTemperature(step.heat.tempC)
                  ? ` · ${formatTemperature(step.heat.tempC)}`
                  : ""}
                {heatFlameNote ? ` — ${heatFlameNote}` : ""}
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
                  {dict.recipeSteps.visualCue}
                </span>
                {visualCue}
              </p>
              <p className="border-l-2 border-paprika pl-3 font-body text-xs text-ink/70">
                <span className="font-meta uppercase tracking-wide text-paprika">
                  {dict.recipeSteps.commonMistake}
                </span>
                {commonMistake}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
