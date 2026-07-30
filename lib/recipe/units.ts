import { formatAmount } from "@/lib/recipe/scaling";

/** Content Standard v3's own worked examples (250 g -> 8.8 oz, 500 ml -> 2.1
 * cups, 180°C -> 356°F) reproduce exactly with these constants — the US
 * customary cup (236.5882365 ml), not the 240 ml US "legal" cup. */
const G_PER_OZ = 28.349523125;
const G_PER_LB = 453.59237;
const ML_PER_CUP = 236.5882365;
const ML_PER_FL_OZ = 29.5735295625;

const WEIGHT_TO_GRAMS: Record<string, number> = { g: 1, kg: 1000 };
const VOLUME_TO_ML: Record<string, number> = { ml: 1, l: 1000 };

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Metric -> imperial for a stored ingredient amount. Deny-by-default: only
 * true weight/volume units (g, kg, ml, l) convert. Everything else actually
 * present in the data — tbsp, tsp, pinch, whole, set, piece(s), pods, drops,
 * medium/large size descriptors — has no unit-system meaning and returns
 * null, same as an unrecognized future unit would (fails safe, not wrong).
 */
export function toImperialAmount(amount: number, unit: string | null): string | null {
  if (unit === null || !Number.isFinite(amount) || amount <= 0) return null;
  const key = unit.trim().toLowerCase();

  if (key in WEIGHT_TO_GRAMS) {
    const grams = amount * WEIGHT_TO_GRAMS[key];
    if (grams >= 1000) {
      const lb = roundTo(grams / G_PER_LB, 2);
      return lb === 0 ? null : `${formatAmount(lb)} lb`;
    }
    const oz = roundTo(grams / G_PER_OZ, 1);
    return oz === 0 ? null : `${formatAmount(oz)} oz`;
  }

  if (key in VOLUME_TO_ML) {
    const ml = amount * VOLUME_TO_ML[key];
    if (ml >= ML_PER_CUP) {
      const cups = roundTo(ml / ML_PER_CUP, 1);
      if (cups === 0) return null;
      return `${formatAmount(cups)} ${cups === 1 ? "cup" : "cups"}`;
    }
    const flOz = roundTo(ml / ML_PER_FL_OZ, 1);
    return flOz === 0 ? null : `${formatAmount(flOz)} fl oz`;
  }

  return null;
}

/** Single-string form for plain-text contexts (e.g. Cook Mode's inlined
 * instruction text) — pairs the stored metric amount with its imperial
 * parenthetical when one exists, or returns the metric amount alone. */
export function formatAmountWithImperial(amount: number, unit: string | null): string {
  const base = `${formatAmount(amount)}${unit ? ` ${unit}` : ""}`;
  const imperial = toImperialAmount(amount, unit);
  return imperial ? `${base} (${imperial})` : base;
}

/** °C -> °F for step temperatures. Accepts null/undefined so callers can
 * write formatTemperature(step.heat?.tempC ?? null) without a nested guard.
 * Rounds to the nearest whole degree — no snapping to conventional oven
 * marks, matching the standard's own exact-conversion example. */
export function formatTemperature(tempC: number | null | undefined): string | null {
  if (tempC === null || tempC === undefined || !Number.isFinite(tempC)) return null;
  const fahrenheit = Math.round((tempC * 9) / 5 + 32);
  return `${tempC}°C (${fahrenheit}°F)`;
}
