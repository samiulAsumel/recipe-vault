import type { NutritionEstimate } from "@/lib/types/recipe";

const WEIGHT_VOLUME_STEP: Record<string, number> = {
  g: 5,
  kg: 0.05,
  ml: 5,
  l: 0.05,
};

const DEFAULT_FRACTIONAL_STEP = 0.25;

/**
 * Section 4: whole-count items (null unit — eggs, onions) round to the nearest
 * whole number; weight/volume round to a "sensible fraction" (nearest 5g/ml,
 * nearest 0.05 kg/L, nearest ¼ tsp/tbsp). Unrecognized units fall back to the
 * same ¼ step as a safe generic default.
 */
function getRoundingStep(unit: string | null): number {
  if (unit === null) return 1;
  return WEIGHT_VOLUME_STEP[unit.toLowerCase()] ?? DEFAULT_FRACTIONAL_STEP;
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function scaleAndRound(
  amount: number,
  unit: string | null,
  baseServings: number,
  targetServings: number,
): number {
  const scaled = amount * (targetServings / baseServings);
  return roundToStep(scaled, getRoundingStep(unit));
}

/** Trims float noise and trailing zeros — 1.2500000001 -> "1.25", 6.0 -> "6". */
export function formatAmount(value: number): string {
  return Number(value.toFixed(2)).toString();
}

export function scaleNutrition(
  estimate: NutritionEstimate,
  baseServings: number,
  targetServings: number,
): NutritionEstimate {
  const ratio = targetServings / baseServings;
  return {
    calories: Math.round(estimate.calories * ratio),
    proteinG: Math.round(estimate.proteinG * ratio),
    carbsG: Math.round(estimate.carbsG * ratio),
    fatG: Math.round(estimate.fatG * ratio),
  };
}
