import type { NutritionEstimate } from '@/types/recipe';

interface NutritionTableProps {
  estimate: NutritionEstimate;
  baseServings: number;
  servings: number;
}

const NUTRITION_ROWS: Array<{ key: keyof NutritionEstimate; label: string; unit: string }> = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'proteinG', label: 'Protein', unit: 'g' },
  { key: 'carbsG', label: 'Carbs', unit: 'g' },
  { key: 'fatG', label: 'Fat', unit: 'g' },
];

/** Section 5: nutrition table "also scales with servings". Nutrition labels scale linearly
 * (no per-unit rounding quirks like ingredients need) and round to the nearest whole number. */
export function NutritionTable({ estimate, baseServings, servings }: NutritionTableProps): React.ReactElement {
  const ratio = baseServings > 0 ? servings / baseServings : 1;

  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">
        Nutrition (per serving estimate)
      </h2>
      <p className="mt-1 text-xs text-ink/50">
        Estimated, not lab-tested. Scaled for {servings} {servings === 1 ? 'serving' : 'servings'}.
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NUTRITION_ROWS.map(({ key, label, unit }) => (
          <div key={key} className="border border-clay-line p-3 text-center">
            <dt className="font-mono text-xs uppercase tracking-widest text-ink/60">{label}</dt>
            <dd className="mt-1 font-mono text-lg text-ink">
              {Math.round(estimate[key] * ratio)}
              <span className="ml-1 text-xs text-ink/50">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
