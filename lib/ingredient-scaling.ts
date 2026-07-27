/** Section 4: "round whole-count items like eggs/onions to the nearest whole number; round
 * weight/volume to a sensible fraction like nearest 5g or nearest ¼ tsp." Units not listed here
 * (pinch, clove, piece, ...) are count-like and fall back to whole-number rounding. */
const UNIT_ROUNDING_STEP: Record<string, number> = {
  g: 5,
  kg: 0.01,
  ml: 5,
  l: 0.01,
  tsp: 0.25,
  tbsp: 0.25,
  cup: 0.25,
};

const DEFAULT_STEP = 1;

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** Scales one ingredient amount from `baseServings` to `targetServings`, rounded to a sensible
 * granularity per unit. Never rounds a genuinely-present ingredient down to zero. */
export function scaleIngredientAmount(
  amount: number,
  baseServings: number,
  targetServings: number,
  unit: string | null,
): number {
  if (baseServings <= 0 || amount <= 0) return amount;

  const raw = amount * (targetServings / baseServings);
  const step = unit ? (UNIT_ROUNDING_STEP[unit] ?? DEFAULT_STEP) : DEFAULT_STEP;
  const rounded = roundToStep(raw, step);

  return Math.max(rounded, step);
}

const SIMPLE_FRACTIONS: ReadonlyArray<readonly [number, string]> = [
  [0.25, '¼'],
  [0.333, '⅓'],
  [0.5, '½'],
  [0.667, '⅔'],
  [0.75, '¾'],
];

const SPOON_AND_CUP_UNITS = new Set(['tsp', 'tbsp', 'cup']);

/** Formats a scaled amount for display - simple fractions (¼, ½, ¾, ...) for spoon/cup units
 * (how recipes are conventionally written), otherwise a clean decimal with no trailing zeros. */
export function formatScaledAmount(amount: number, unit: string | null): string {
  if (unit && SPOON_AND_CUP_UNITS.has(unit)) {
    const whole = Math.floor(amount);
    const fraction = amount - whole;
    const closest = SIMPLE_FRACTIONS.find(([value]) => Math.abs(fraction - value) < 0.02);

    if (closest) {
      const [, symbol] = closest;
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }

  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function formatAmountWithUnit(amount: number, unit: string | null): string {
  const formatted = formatScaledAmount(amount, unit);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}
