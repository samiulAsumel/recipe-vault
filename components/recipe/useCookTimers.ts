"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { minutesToMs } from "@/lib/recipe/timers";

export type TimerStatus = "idle" | "running" | "paused" | "done";

/** Absolute-time timer record — endsAt is an epoch ms deadline, not a countdown,
 * so a backgrounded or throttled tab always recovers the correct remaining time. */
export interface TimerEntry {
  durationMs: number;
  endsAt: number | null;
  pausedRemainingMs: number | null;
  firedComplete: boolean;
}

export interface StepTimerInfo {
  status: TimerStatus;
  remainingMs: number;
  endsAt: number | null;
}

const ONE_MINUTE_MS = 60_000;

export function useCookTimers(onComplete?: (stepNumber: number) => void): {
  getInfo: (stepNumber: number, durationMinutes: number) => StepTimerInfo;
  start: (stepNumber: number, durationMinutes: number) => void;
  pause: (stepNumber: number) => void;
  resume: (stepNumber: number) => void;
  reset: (stepNumber: number) => void;
  addMinute: (stepNumber: number) => void;
  entries: Record<number, TimerEntry>;
  restore: (restored: Record<number, TimerEntry>) => void;
} {
  const [entries, setEntries] = useState<Record<number, TimerEntry>>({});
  const [now, setNow] = useState(() => Date.now());
  const entriesRef = useRef(entries);
  // Refs must not be mutated during render — sync it in an effect (the standard
  // "latest ref" pattern) so the completion-check effect below always reads fresh state.
  useEffect(() => {
    entriesRef.current = entries;
  });

  // A single interval drives every running timer's re-render — no per-timer intervals.
  useEffect(() => {
    const hasRunning = Object.values(entries).some((entry) => entry.endsAt !== null);
    if (!hasRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [entries]);

  // Fires onComplete exactly once per timer, the tick after it crosses its deadline.
  useEffect(() => {
    const current = entriesRef.current;
    const completedSteps: number[] = [];
    let changed = false;
    const next: Record<number, TimerEntry> = { ...current };

    for (const [key, entry] of Object.entries(current)) {
      const stepNumber = Number(key);
      if (entry.endsAt !== null && now >= entry.endsAt && !entry.firedComplete) {
        next[stepNumber] = { ...entry, firedComplete: true };
        changed = true;
        completedSteps.push(stepNumber);
      }
    }

    if (changed) setEntries(next);
    completedSteps.forEach((stepNumber) => onComplete?.(stepNumber));
  }, [now, onComplete]);

  const start = useCallback((stepNumber: number, durationMinutes: number) => {
    const durationMs = minutesToMs(durationMinutes);
    setEntries((current) => ({
      ...current,
      [stepNumber]: { durationMs, endsAt: Date.now() + durationMs, pausedRemainingMs: null, firedComplete: false },
    }));
  }, []);

  const resume = useCallback((stepNumber: number) => {
    setEntries((current) => {
      const entry = current[stepNumber];
      if (!entry || entry.pausedRemainingMs === null) return current;
      return {
        ...current,
        [stepNumber]: { ...entry, endsAt: Date.now() + entry.pausedRemainingMs, pausedRemainingMs: null },
      };
    });
  }, []);

  const pause = useCallback((stepNumber: number) => {
    setEntries((current) => {
      const entry = current[stepNumber];
      if (!entry || entry.endsAt === null) return current;
      return {
        ...current,
        [stepNumber]: { ...entry, pausedRemainingMs: Math.max(0, entry.endsAt - Date.now()), endsAt: null },
      };
    });
  }, []);

  const reset = useCallback((stepNumber: number) => {
    setEntries((current) => {
      if (!(stepNumber in current)) return current;
      const next = { ...current };
      delete next[stepNumber];
      return next;
    });
  }, []);

  const addMinute = useCallback((stepNumber: number) => {
    setEntries((current) => {
      const entry = current[stepNumber];
      if (!entry) return current;
      if (entry.endsAt !== null) {
        return { ...current, [stepNumber]: { ...entry, endsAt: entry.endsAt + ONE_MINUTE_MS } };
      }
      if (entry.pausedRemainingMs !== null) {
        return {
          ...current,
          [stepNumber]: { ...entry, pausedRemainingMs: entry.pausedRemainingMs + ONE_MINUTE_MS },
        };
      }
      return current;
    });
  }, []);

  const getInfo = useCallback(
    (stepNumber: number, durationMinutes: number): StepTimerInfo => {
      const entry = entries[stepNumber];
      if (!entry) {
        return { status: "idle", remainingMs: minutesToMs(durationMinutes), endsAt: null };
      }
      if (entry.endsAt !== null) {
        const remainingMs = entry.endsAt - now;
        return remainingMs <= 0
          ? { status: "done", remainingMs: 0, endsAt: entry.endsAt }
          : { status: "running", remainingMs, endsAt: entry.endsAt };
      }
      if (entry.pausedRemainingMs !== null) {
        return { status: "paused", remainingMs: entry.pausedRemainingMs, endsAt: null };
      }
      return { status: "idle", remainingMs: entry.durationMs, endsAt: null };
    },
    [entries, now],
  );

  const restore = useCallback((restored: Record<number, TimerEntry>) => {
    setEntries((current) => {
      const next: Record<number, TimerEntry> = { ...current };
      for (const [key, entry] of Object.entries(restored)) {
        next[Number(key)] = { ...entry, firedComplete: false };
      }
      return next;
    });
  }, []);

  return { getInfo, start, pause, resume, reset, addMinute, entries, restore };
}
