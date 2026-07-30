"use client";

import { usePathname } from "next/navigation";
import { StepTimer } from "@/components/recipe/StepTimer";
import type { StepTimerInfo } from "@/components/recipe/useCookTimers";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import { tokenizeInstruction } from "@/lib/recipe/instructions";
import { scaleAndRound } from "@/lib/recipe/scaling";
import { formatMinutesLabel } from "@/lib/recipe/timers";
import { formatAmountWithImperial, formatTemperature } from "@/lib/recipe/units";
import type { IngredientItem, RecipeStep } from "@/lib/types/recipe";

interface CookStepProps {
  /** Already merged with any translation by the caller (CookMode) — this
   * component itself does no translation lookup, just formatting. */
  step: RecipeStep;
  ingredientMap: Map<string, IngredientItem>;
  baseServings: number;
  servings: number;
  isChecked: boolean;
  onToggleChecked: () => void;
  timerInfo: StepTimerInfo;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onAddMinuteTimer: () => void;
}

export function CookStep({
  step,
  ingredientMap,
  baseServings,
  servings,
  isChecked,
  onToggleChecked,
  timerInfo,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onAddMinuteTimer,
}: CookStepProps): React.JSX.Element {
  const locale = getLocaleFromPathname(usePathname());
  const dict = getDictionary(locale);
  const tokens = tokenizeInstruction(step.instruction, ingredientMap);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          <span className="mr-3 font-meta text-lg text-ink/40">
            {String(step.stepNumber).padStart(2, "0")}
          </span>
          {step.title}
        </h2>
        <span className="whitespace-nowrap font-meta text-sm text-ink/60">
          {formatMinutesLabel(step.durationMinutes, locale)}
        </span>
      </div>

      {step.heat && (
        <p className="font-meta text-sm text-paprika">
          {step.heat.level}
          {formatTemperature(step.heat.tempC) ? ` · ${formatTemperature(step.heat.tempC)}` : ""}
          {step.heat.flameNote ? ` — ${step.heat.flameNote}` : ""}
        </p>
      )}

      <p className="max-w-prose font-body text-lg leading-relaxed text-ink/90">
        {tokens.map((token, index) =>
          token.type === "text" ? (
            <span key={index}>{token.value}</span>
          ) : (
            <strong
              key={index}
              className="font-medium text-ink underline decoration-clay-line decoration-2 underline-offset-2"
            >
              {formatAmountWithImperial(
                scaleAndRound(token.item.amount, token.item.unit, baseServings, servings),
                token.item.unit,
              )}{" "}
              {token.item.name}
            </strong>
          ),
        )}
      </p>

      <p className="font-meta text-xs uppercase tracking-wide text-ink/50">{step.technique}</p>

      {step.durationMinutes > 0 && (
        <StepTimer
          durationMinutes={step.durationMinutes}
          info={timerInfo}
          onStart={onStartTimer}
          onPause={onPauseTimer}
          onResume={onResumeTimer}
          onReset={onResetTimer}
          onAddMinute={onAddMinuteTimer}
        />
      )}

      <div className="flex flex-col gap-2">
        <p className="border-l-2 border-cardamom pl-3 font-body text-sm text-ink/70">
          <span className="font-meta uppercase tracking-wide text-cardamom">
            {dict.recipeSteps.visualCue}
          </span>
          {step.visualCue}
        </p>
        <p className="border-l-2 border-paprika pl-3 font-body text-sm text-ink/70">
          <span className="font-meta uppercase tracking-wide text-paprika">
            {dict.recipeSteps.commonMistake}
          </span>
          {step.commonMistake}
        </p>
      </div>

      <label className="flex items-center gap-2 border-t border-clay-line pt-4 font-meta text-sm text-ink/70">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleChecked}
          className="h-4 w-4 accent-turmeric"
        />
        {dict.cookMode.markStepDone}
      </label>
    </div>
  );
}
