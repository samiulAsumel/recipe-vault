"use client";

import { usePathname } from "next/navigation";
import type { StepTimerInfo } from "@/components/recipe/useCookTimers";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";
import { formatClockTime, formatCountdown } from "@/lib/recipe/timers";

const LONG_TIMER_THRESHOLD_MINUTES = 60;

interface StepTimerProps {
  durationMinutes: number;
  info: StepTimerInfo;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAddMinute: () => void;
}

const buttonClass = "rounded-[5px] border border-clay-line px-3 py-1 font-meta text-xs hover:border-turmeric";

export function StepTimer({
  durationMinutes,
  info,
  onStart,
  onPause,
  onResume,
  onReset,
  onAddMinute,
}: StepTimerProps): React.JSX.Element {
  const locale = getLocaleFromPathname(usePathname());
  const dict = getDictionary(locale);
  const isLong = durationMinutes >= LONG_TIMER_THRESHOLD_MINUTES;

  // Long timers (marinating, dum-cooking) show a target clock time rather than
  // a ticking countdown — "ready at 9:40 PM" is more useful than "7:58:12".
  const readout =
    info.status === "running" && isLong && info.endsAt !== null
      ? dict.stepTimer.readyAt(formatClockTime(info.endsAt, locale))
      : formatCountdown(info.remainingMs);

  return (
    <div
      role="timer"
      className={`flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 font-meta text-sm ${
        info.status === "done" ? "border-cardamom bg-cardamom/10 text-cardamom" : "border-clay-line bg-surface text-ink"
      }`}
    >
      <span className="min-w-[6.5rem] tabular-nums">
        {info.status === "done" ? dict.stepTimer.timerDone : readout}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {info.status === "idle" && (
          <button type="button" onClick={onStart} className={buttonClass}>
            {dict.stepTimer.start}
          </button>
        )}
        {info.status === "running" && (
          <>
            <button type="button" onClick={onPause} className={buttonClass}>
              {dict.stepTimer.pause}
            </button>
            <button type="button" onClick={onAddMinute} className={buttonClass}>
              {dict.stepTimer.addMinute}
            </button>
          </>
        )}
        {info.status === "paused" && (
          <>
            <button type="button" onClick={onResume} className={buttonClass}>
              {dict.stepTimer.resume}
            </button>
            <button type="button" onClick={onAddMinute} className={buttonClass}>
              {dict.stepTimer.addMinute}
            </button>
          </>
        )}
        {info.status !== "idle" && (
          <button type="button" onClick={onReset} className="font-meta text-xs text-paprika hover:underline">
            {dict.stepTimer.reset}
          </button>
        )}
      </div>
    </div>
  );
}
