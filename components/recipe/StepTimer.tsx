"use client";

import type { StepTimerInfo } from "@/components/recipe/useCookTimers";
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

const buttonClass = "border border-clay-line px-3 py-1 font-meta text-xs hover:border-ink";

export function StepTimer({
  durationMinutes,
  info,
  onStart,
  onPause,
  onResume,
  onReset,
  onAddMinute,
}: StepTimerProps): React.JSX.Element {
  const isLong = durationMinutes >= LONG_TIMER_THRESHOLD_MINUTES;

  // Long timers (marinating, dum-cooking) show a target clock time rather than
  // a ticking countdown — "ready at 9:40 PM" is more useful than "7:58:12".
  const readout =
    info.status === "running" && isLong && info.endsAt !== null
      ? `Ready at ${formatClockTime(info.endsAt)}`
      : formatCountdown(info.remainingMs);

  return (
    <div
      role="timer"
      className={`flex flex-wrap items-center gap-3 border px-4 py-3 font-meta text-sm ${
        info.status === "done" ? "border-cardamom bg-cardamom/10 text-cardamom" : "border-clay-line text-ink"
      }`}
    >
      <span className="min-w-[6.5rem] tabular-nums">
        {info.status === "done" ? "Timer done" : readout}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {info.status === "idle" && (
          <button type="button" onClick={onStart} className={buttonClass}>
            Start
          </button>
        )}
        {info.status === "running" && (
          <>
            <button type="button" onClick={onPause} className={buttonClass}>
              Pause
            </button>
            <button type="button" onClick={onAddMinute} className={buttonClass}>
              +1 min
            </button>
          </>
        )}
        {info.status === "paused" && (
          <>
            <button type="button" onClick={onResume} className={buttonClass}>
              Resume
            </button>
            <button type="button" onClick={onAddMinute} className={buttonClass}>
              +1 min
            </button>
          </>
        )}
        {info.status !== "idle" && (
          <button type="button" onClick={onReset} className="font-meta text-xs text-paprika hover:underline">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
