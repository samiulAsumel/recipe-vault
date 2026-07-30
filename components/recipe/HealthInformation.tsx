import type { HealthInfo } from "@/lib/types/recipe";

interface HealthInformationProps {
  healthInfo: HealthInfo;
}

/** Hardcoded rather than a stored field — v3 standard Section 17 requires this
 * disclaimer on every recipe, and a per-dish string could be silently omitted
 * by a future recipe-add run. */
const DISCLAIMER =
  "Informational only, not medical or dietary advice. Nutrition values are approximate and vary by brand and preparation.";

export function HealthInformation({
  healthInfo,
}: HealthInformationProps): React.JSX.Element | null {
  const benefits = healthInfo.benefits ?? [];
  const allergens = healthInfo.allergens ?? [];
  const considerations = healthInfo.dietaryConsiderations ?? [];

  if (benefits.length === 0 && allergens.length === 0 && considerations.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl text-ink">Health information</h2>

      {benefits.length > 0 && (
        <div>
          <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">Benefits</h3>
          <ul className="mt-1 flex flex-col gap-1.5 font-body text-sm text-ink/80">
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {allergens.length > 0 && (
        <div className="border-l-2 border-paprika pl-3">
          <h3 className="font-meta text-xs uppercase tracking-wide text-paprika">Allergens</h3>
          <ul className="mt-1 flex flex-col gap-1.5 font-body text-sm text-ink/80">
            {allergens.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {considerations.length > 0 && (
        <div>
          <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
            Dietary considerations
          </h3>
          <ul className="mt-1 flex flex-col gap-1.5 font-body text-sm text-ink/80">
            {considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="font-body text-xs italic text-ink/50">{DISCLAIMER}</p>
    </section>
  );
}
