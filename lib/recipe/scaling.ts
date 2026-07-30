import type { EstimatedCost, NutritionEstimate } from "@/lib/types/recipe";

/** Scales one optional micronutrient field, omitting the key entirely when the
 * source is undefined rather than coercing it to 0 (0 would read as "measured
 * zero," not "not recorded for this dish"). */
function scaleOptional(
  value: number | undefined,
  ratio: number,
): number | undefined {
  return value === undefined ? undefined : Math.round(value * ratio);
}

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

const OPTIONAL_NUTRITION_KEYS = [
  "saturatedFatG",
  "fiberG",
  "sugarG",
  "sodiumMg",
  "potassiumMg",
  "ironMg",
  "calciumMg",
  "vitaminAMcg",
  "vitaminCMg",
  "vitaminDMcg",
  "cholesterolMg",
] as const satisfies ReadonlyArray<keyof NutritionEstimate>;

export function scaleNutrition(
  estimate: NutritionEstimate,
  baseServings: number,
  targetServings: number,
): NutritionEstimate {
  const ratio = targetServings / baseServings;
  const scaled: NutritionEstimate = {
    calories: Math.round(estimate.calories * ratio),
    proteinG: Math.round(estimate.proteinG * ratio),
    carbsG: Math.round(estimate.carbsG * ratio),
    fatG: Math.round(estimate.fatG * ratio),
  };
  for (const key of OPTIONAL_NUTRITION_KEYS) {
    const value = scaleOptional(estimate[key], ratio);
    if (value !== undefined) scaled[key] = value;
  }
  return scaled;
}

/** Cost is stored per-serving, so scaling to a target serving count is a direct
 * multiply — unlike ingredients/nutrition, there's no baseServings ratio involved. */
export function scaleCost(cost: EstimatedCost, targetServings: number): number {
  return Math.round(cost.costPerServing * targetServings * 100) / 100;
}
