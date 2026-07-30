import type { Locale } from "@/lib/i18n";
import { DURATION_UNIT_LABELS } from "@/lib/i18n/labels";

export function minutesToMs(minutes: number): number {
  return minutes * 60_000;
}

/** "04:32" under an hour, "1:20:00" at or above an hour. Negative input clamps to zero. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const CLOCK_TIME_BCP47: Record<Locale, string> = { en: "en-US", bn: "bn-BD" };

/** Formats a future epoch timestamp as a local clock time, e.g. "9:40 PM".
 * Takes the PAGE's locale explicitly rather than defaulting to the visitor's
 * browser locale — a Bengali page's timer must read in Bengali regardless of
 * what the visitor's browser is set to, and vice versa. */
export function formatClockTime(epochMs: number, locale: Locale = "en"): string {
  return new Date(epochMs).toLocaleTimeString(CLOCK_TIME_BCP47[locale], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "45 min" / "3 hr" / "3 hr 15 min" — a duration label, distinct from formatCountdown's ticking readout. */
export function formatMinutesLabel(minutes: number, locale: Locale = "en"): string {
  const { min, hr } = DURATION_UNIT_LABELS[locale];
  if (minutes < 60) return `${minutes} ${min}`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} ${hr}` : `${hours} ${hr} ${remainder} ${min}`;
}
