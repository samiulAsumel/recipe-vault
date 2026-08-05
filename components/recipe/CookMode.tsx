"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CookStep } from "@/components/recipe/CookStep";
import { useRecipeWorkspace } from "@/components/recipe/RecipeWorkspace";
import { useCookTimers, type TimerEntry } from "@/components/recipe/useCookTimers";
import { useWakeLock } from "@/components/recipe/useWakeLock";
import { Button } from "@/components/ui/Button";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import { primeTimerAudio, playTimerBeep } from "@/lib/recipe/beep";
import { applyIngredientTranslations, buildIngredientMap } from "@/lib/recipe/instructions";
import { readJson, remove, writeJson } from "@/lib/storage/local";
import type { FullRecipe } from "@/lib/types/recipe";

interface PersistedCookState {
  currentIndex: number;
  checkedSteps: number[];
  timers: Record<number, TimerEntry>;
  servings: number;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

interface CookModeProps {
  dish: FullRecipe;
}

export function CookMode({ dish }: CookModeProps): React.JSX.Element | null {
  const { isCookMode, closeCookMode, servings, setServings } = useRecipeWorkspace();
  const locale = getLocaleFromPathname(usePathname());
  const dict = getDictionary(locale);
  const bn = locale === "bn" ? dish.translations?.bn : undefined;
  const dishName = bn?.name ?? dish.name;
  const miseEnPlace = bn?.miseEnPlace ?? dish.miseEnPlace;
  const steps = useMemo(
    () =>
      dish.steps.map((step) => {
        const t = bn?.steps?.[step.stepNumber];
        if (!t) return step;
        return {
          ...step,
          title: t.title ?? step.title,
          instruction: t.instruction ?? step.instruction,
          technique: t.technique ?? step.technique,
          visualCue: t.visualCue ?? step.visualCue,
          commonMistake: t.commonMistake ?? step.commonMistake,
          heat: step.heat && {
            ...step.heat,
            level: t.heat?.level ?? step.heat.level,
            flameNote: t.heat?.flameNote ?? step.heat.flameNote,
          },
        };
      }),
    [dish.steps, bn],
  );
  const storageKey = `cook:${dish.id}`;
  const hasMiseEnPlace = miseEnPlace.length > 0;

  const [currentIndex, setCurrentIndex] = useState(hasMiseEnPlace ? -1 : 0);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [prepChecked, setPrepChecked] = useState<boolean[]>(() => miseEnPlace.map(() => false));
  const [timerAnnouncement, setTimerAnnouncement] = useState("");
  const hasRestoredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleTimerComplete = useCallback(
    (stepNumber: number) => {
      const step = steps.find((s) => s.stepNumber === stepNumber);
      setTimerAnnouncement(dict.cookMode.timerDoneAnnouncement(step ? step.title : `#${stepNumber}`));
      playTimerBeep();
    },
    [steps, dict],
  );

  const timers = useCookTimers(handleTimerComplete);
  useWakeLock(isCookMode);

  const ingredientMap = useMemo(
    () => buildIngredientMap(applyIngredientTranslations(dish.ingredientGroups, bn)),
    [dish.ingredientGroups, bn],
  );

  // Restore persisted progress once per mount, after hydration — never read localStorage during
  // render (server has no window, so an initializer here would cause a hydration mismatch).
  // This is the sanctioned exception to react-hooks/set-state-in-effect: syncing from an external
  // store (localStorage) that isn't safely readable during render.
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    const persisted = readJson<PersistedCookState | null>(storageKey, null);
    if (!persisted) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(persisted.currentIndex);
    setCheckedSteps(persisted.checkedSteps);
    setServings(persisted.servings);
    timers.restore(persisted.timers);
    // Restoring is a one-time mount effect — intentionally not re-run on dependency changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    writeJson<PersistedCookState>(storageKey, {
      currentIndex,
      checkedSteps,
      timers: timers.entries,
      servings,
    });
  }, [storageKey, currentIndex, checkedSteps, timers.entries, servings]);

  useEffect(() => {
    if (!isCookMode) return;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        closeCookMode();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCookMode, closeCookMode]);

  if (!isCookMode) return null;

  const totalSteps = steps.length;
  const isPrepPhase = currentIndex === -1;
  const isAtStart = currentIndex <= (hasMiseEnPlace ? -1 : 0);
  const isLastStep = currentIndex === totalSteps - 1;
  // Derived directly from render state (not an effect) — the aria-live region announces
  // this automatically whenever its text changes, which is exactly on step navigation.
  const stepAnnouncement = isPrepPhase
    ? dict.cookMode.miseEnPlace
    : dict.cookMode.stepAnnouncement(currentIndex + 1, totalSteps, steps[currentIndex].title);

  function goNext(): void {
    if (currentIndex < totalSteps - 1) setCurrentIndex(currentIndex + 1);
  }
  function goPrevious(): void {
    if (!isAtStart) setCurrentIndex(currentIndex - 1);
  }
  function toggleStepChecked(stepNumber: number): void {
    setCheckedSteps((current) =>
      current.includes(stepNumber) ? current.filter((n) => n !== stepNumber) : [...current, stepNumber],
    );
  }
  function togglePrepChecked(index: number): void {
    setPrepChecked((current) => current.map((value, i) => (i === index ? !value : value)));
  }
  function finish(): void {
    remove(storageKey);
    closeCookMode();
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dict.cookMode.ariaLabel(dishName)}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-parchment"
    >
      <div aria-live="polite" className="sr-only">
        {stepAnnouncement}
      </div>
      <div aria-live="assertive" className="sr-only">
        {timerAnnouncement}
      </div>

      <header className="flex items-center justify-between gap-4 border-b border-clay-line px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl text-ink">{dishName}</h1>
          <span className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {isPrepPhase ? dict.cookMode.miseEnPlace : dict.cookMode.stepStatus(currentIndex + 1, totalSteps)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-clay-line px-3 py-1">
            <span className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {dict.cookMode.servings}
            </span>
            <button
              type="button"
              aria-label={dict.cookMode.decreaseServings}
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="flex h-6 w-6 items-center justify-center border border-clay-line hover:border-ink"
            >
              −
            </button>
            <span className="w-5 text-center font-meta text-sm">{servings}</span>
            <button
              type="button"
              aria-label={dict.cookMode.increaseServings}
              onClick={() => setServings(servings + 1)}
              className="flex h-6 w-6 items-center justify-center border border-clay-line hover:border-ink"
            >
              +
            </button>
          </div>
          <button type="button" onClick={closeCookMode} className="font-meta text-sm text-paprika hover:underline">
            {dict.cookMode.close}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav
          aria-label={dict.cookMode.stepsAriaLabel}
          className="hidden w-64 shrink-0 overflow-y-auto border-r border-clay-line p-4 sm:block"
        >
          <ol className="flex flex-col gap-1">
            {hasMiseEnPlace && (
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentIndex(-1)}
                  aria-current={isPrepPhase ? "step" : undefined}
                  className={`w-full border px-3 py-2 text-left font-meta text-xs uppercase tracking-wide ${
                    isPrepPhase
                      ? "border-accent-1 bg-accent-1/10 text-ink"
                      : "border-transparent text-ink/60 hover:text-ink"
                  }`}
                >
                  {dict.cookMode.miseEnPlace}
                </button>
              </li>
            )}
            {steps.map((step, index) => {
              const info = timers.getInfo(step.stepNumber, step.durationMinutes);
              const isActive = currentIndex === index;
              return (
                <li key={step.stepNumber}>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-current={isActive ? "step" : undefined}
                    className={`flex w-full items-center justify-between gap-2 border px-3 py-2 text-left font-body text-sm ${
                      isActive
                        ? "border-accent-1 bg-accent-1/10 text-ink"
                        : "border-transparent text-ink/70 hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {checkedSteps.includes(step.stepNumber) && <span aria-hidden>✓</span>}
                      {String(step.stepNumber).padStart(2, "0")}. {step.title}
                    </span>
                    {(info.status === "running" || info.status === "paused") && (
                      <span aria-hidden className="font-meta text-xs text-turmeric">
                        ●
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-8">
            {isPrepPhase ? (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-2xl text-ink">{dict.cookMode.miseEnPlace}</h2>
                <ul className="flex flex-col gap-3">
                  {miseEnPlace.map((item, index) => (
                    <li key={item}>
                      <label className="flex items-center gap-3 font-body text-base text-ink/90">
                        <input
                          type="checkbox"
                          checked={prepChecked[index] ?? false}
                          onChange={() => togglePrepChecked(index)}
                          className="h-4 w-4 accent-turmeric"
                        />
                        {item}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <CookStep
                step={steps[currentIndex]}
                ingredientMap={ingredientMap}
                baseServings={dish.baseServings}
                servings={servings}
                isChecked={checkedSteps.includes(steps[currentIndex].stepNumber)}
                onToggleChecked={() => toggleStepChecked(steps[currentIndex].stepNumber)}
                timerInfo={timers.getInfo(
                  steps[currentIndex].stepNumber,
                  steps[currentIndex].durationMinutes,
                )}
                onStartTimer={() => {
                  primeTimerAudio();
                  timers.start(steps[currentIndex].stepNumber, steps[currentIndex].durationMinutes);
                }}
                onPauseTimer={() => timers.pause(steps[currentIndex].stepNumber)}
                onResumeTimer={() => {
                  primeTimerAudio();
                  timers.resume(steps[currentIndex].stepNumber);
                }}
                onResetTimer={() => timers.reset(steps[currentIndex].stepNumber)}
                onAddMinuteTimer={() => timers.addMinute(steps[currentIndex].stepNumber)}
              />
            )}
          </div>

          <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-clay-line bg-parchment px-6 py-4">
            <Button onClick={goPrevious} disabled={isAtStart}>
              {dict.cookMode.previous}
            </Button>
            {isLastStep ? (
              <button
                type="button"
                onClick={finish}
                className="border border-cardamom bg-cardamom/10 px-4 py-2 font-meta text-xs uppercase tracking-wide text-cardamom hover:border-ink"
              >
                {dict.cookMode.finish}
              </button>
            ) : (
              <Button onClick={goNext}>{dict.cookMode.next}</Button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
