"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CookStep } from "@/components/recipe/CookStep";
import { useRecipeWorkspace } from "@/components/recipe/RecipeWorkspace";
import { useCookTimers, type TimerEntry } from "@/components/recipe/useCookTimers";
import { useWakeLock } from "@/components/recipe/useWakeLock";
import { primeTimerAudio, playTimerBeep } from "@/lib/recipe/beep";
import { buildIngredientMap } from "@/lib/recipe/instructions";
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

const navButtonClass = "border border-clay-line px-4 py-2 font-meta text-sm hover:border-ink disabled:opacity-30";

interface CookModeProps {
  dish: FullRecipe;
}

export function CookMode({ dish }: CookModeProps): React.JSX.Element | null {
  const { isCookMode, closeCookMode, servings, setServings } = useRecipeWorkspace();
  const storageKey = `cook:${dish.id}`;
  const hasMiseEnPlace = dish.miseEnPlace.length > 0;

  const [currentIndex, setCurrentIndex] = useState(hasMiseEnPlace ? -1 : 0);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [prepChecked, setPrepChecked] = useState<boolean[]>(() => dish.miseEnPlace.map(() => false));
  const [timerAnnouncement, setTimerAnnouncement] = useState("");
  const hasRestoredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleTimerComplete = useCallback(
    (stepNumber: number) => {
      const step = dish.steps.find((s) => s.stepNumber === stepNumber);
      setTimerAnnouncement(`Timer for ${step ? step.title : `step ${stepNumber}`} is done.`);
      playTimerBeep();
    },
    [dish.steps],
  );

  const timers = useCookTimers(handleTimerComplete);
  useWakeLock(isCookMode);

  const ingredientMap = useMemo(
    () => buildIngredientMap(dish.ingredientGroups),
    [dish.ingredientGroups],
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

  const totalSteps = dish.steps.length;
  const isPrepPhase = currentIndex === -1;
  const isAtStart = currentIndex <= (hasMiseEnPlace ? -1 : 0);
  const isLastStep = currentIndex === totalSteps - 1;
  // Derived directly from render state (not an effect) — the aria-live region announces
  // this automatically whenever its text changes, which is exactly on step navigation.
  const stepAnnouncement = isPrepPhase
    ? "Mise en place"
    : `Step ${currentIndex + 1} of ${totalSteps}: ${dish.steps[currentIndex].title}`;

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
      aria-label={`Cook Mode — ${dish.name}`}
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
          <h1 className="font-display text-xl text-ink">{dish.name}</h1>
          <span className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {isPrepPhase ? "Mise en place" : `Step ${currentIndex + 1} / ${totalSteps}`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-clay-line px-3 py-1">
            <span className="font-meta text-xs uppercase tracking-wide text-ink/50">Servings</span>
            <button
              type="button"
              aria-label="Decrease servings"
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="flex h-6 w-6 items-center justify-center border border-clay-line hover:border-ink"
            >
              −
            </button>
            <span className="w-5 text-center font-meta text-sm">{servings}</span>
            <button
              type="button"
              aria-label="Increase servings"
              onClick={() => setServings(servings + 1)}
              className="flex h-6 w-6 items-center justify-center border border-clay-line hover:border-ink"
            >
              +
            </button>
          </div>
          <button type="button" onClick={closeCookMode} className="font-meta text-sm text-paprika hover:underline">
            Close
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav
          aria-label="Steps"
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
                  Mise en place
                </button>
              </li>
            )}
            {dish.steps.map((step, index) => {
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
                <h2 className="font-display text-2xl text-ink">Mise en place</h2>
                <ul className="flex flex-col gap-3">
                  {dish.miseEnPlace.map((item, index) => (
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
                step={dish.steps[currentIndex]}
                ingredientMap={ingredientMap}
                baseServings={dish.baseServings}
                servings={servings}
                isChecked={checkedSteps.includes(dish.steps[currentIndex].stepNumber)}
                onToggleChecked={() => toggleStepChecked(dish.steps[currentIndex].stepNumber)}
                timerInfo={timers.getInfo(
                  dish.steps[currentIndex].stepNumber,
                  dish.steps[currentIndex].durationMinutes,
                )}
                onStartTimer={() => {
                  primeTimerAudio();
                  timers.start(dish.steps[currentIndex].stepNumber, dish.steps[currentIndex].durationMinutes);
                }}
                onPauseTimer={() => timers.pause(dish.steps[currentIndex].stepNumber)}
                onResumeTimer={() => {
                  primeTimerAudio();
                  timers.resume(dish.steps[currentIndex].stepNumber);
                }}
                onResetTimer={() => timers.reset(dish.steps[currentIndex].stepNumber)}
                onAddMinuteTimer={() => timers.addMinute(dish.steps[currentIndex].stepNumber)}
              />
            )}
          </div>

          <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-clay-line bg-parchment px-6 py-4">
            <button type="button" onClick={goPrevious} disabled={isAtStart} className={navButtonClass}>
              Previous
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={finish}
                className="border border-cardamom bg-cardamom/10 px-4 py-2 font-meta text-sm text-cardamom hover:border-ink"
              >
                Finish
              </button>
            ) : (
              <button type="button" onClick={goNext} className={navButtonClass}>
                Next
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
