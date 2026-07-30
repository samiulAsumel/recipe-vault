import { getDictionary, type Locale } from "@/lib/i18n";
import type { ConfidenceLevel } from "@/lib/types/recipe";

const STYLES: Record<ConfidenceLevel, string> = {
  high: "border-accent-1 bg-accent-1/10 text-ink",
  medium: "border-clay-line text-ink/70",
  low: "border-clay-line/70 text-ink/40",
};

interface ConfidenceBadgeProps {
  confidenceLevel: ConfidenceLevel;
  locale?: Locale;
  className?: string;
}

/** Compact labeled badge for dense listings (dish cards). AtlasPin remains the
 * map-pin treatment for hero/detail-page headers where there's room to read it. */
export function ConfidenceBadge({
  confidenceLevel,
  locale = "en",
  className,
}: ConfidenceBadgeProps): React.JSX.Element {
  const dict = getDictionary(locale);
  const label =
    confidenceLevel === "high"
      ? dict.confidence.high
      : confidenceLevel === "medium"
        ? dict.confidence.medium
        : dict.confidence.low;
  return (
    <span
      role="img"
      aria-label={dict.confidence.ariaLabel(label)}
      className={`shrink-0 whitespace-nowrap border px-2 py-0.5 font-meta text-[10px] uppercase tracking-wide ${STYLES[confidenceLevel]} ${className ?? ""}`}
    >
      {label}
    </span>
  );
}
