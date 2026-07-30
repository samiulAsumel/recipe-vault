import { getDictionary, type Locale } from "@/lib/i18n";
import type { HealthInfo } from "@/lib/types/recipe";

interface HealthInformationProps {
  healthInfo: HealthInfo;
  /** translations.bn.healthInfo — full-array override per section, used
   * whenever present rather than requiring per-item merging (an allergen
   * list is small and translated as a whole set). */
  translatedHealthInfo?: HealthInfo;
  locale?: Locale;
}

export function HealthInformation({
  healthInfo,
  translatedHealthInfo,
  locale = "en",
}: HealthInformationProps): React.JSX.Element | null {
  const dict = getDictionary(locale);
  const useBn = locale === "bn";
  const benefits = (useBn ? translatedHealthInfo?.benefits : undefined) ?? healthInfo.benefits ?? [];
  const allergens = (useBn ? translatedHealthInfo?.allergens : undefined) ?? healthInfo.allergens ?? [];
  const considerations =
    (useBn ? translatedHealthInfo?.dietaryConsiderations : undefined) ??
    healthInfo.dietaryConsiderations ??
    [];

  if (benefits.length === 0 && allergens.length === 0 && considerations.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl text-ink">{dict.healthInformation.heading}</h2>

      {benefits.length > 0 && (
        <div>
          <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {dict.healthInformation.benefits}
          </h3>
          <ul className="mt-1 flex flex-col gap-1.5 font-body text-sm text-ink/80">
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {allergens.length > 0 && (
        <div className="border-l-2 border-paprika pl-3">
          <h3 className="font-meta text-xs uppercase tracking-wide text-paprika">
            {dict.healthInformation.allergens}
          </h3>
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
            {dict.healthInformation.dietaryConsiderations}
          </h3>
          <ul className="mt-1 flex flex-col gap-1.5 font-body text-sm text-ink/80">
            {considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="font-body text-xs italic text-ink/50">{dict.healthInformation.disclaimer}</p>
    </section>
  );
}
