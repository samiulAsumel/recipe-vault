import type { ConfidenceLevel } from "@/lib/types/recipe";

const LABELS: Record<ConfidenceLevel, string> = {
  high: "Verified",
  medium: "Likely",
  low: "Unverified",
};

const STYLES: Record<ConfidenceLevel, string> = {
  high: "border-accent-1 bg-accent-1/10 text-ink",
  medium: "border-clay-line text-ink/70",
  low: "border-clay-line/70 text-ink/40",
};

interface ConfidenceBadgeProps {
  confidenceLevel: ConfidenceLevel;
  className?: string;
}

/** Compact labeled badge for dense listings (dish cards). AtlasPin remains the
 * map-pin treatment for hero/detail-page headers where there's room to read it. */
export function ConfidenceBadge({
  confidenceLevel,
  className,
}: ConfidenceBadgeProps): React.JSX.Element {
  return (
    <span
      role="img"
      aria-label={`Confidence: ${confidenceLevel}`}
      className={`shrink-0 whitespace-nowrap border px-2 py-0.5 font-meta text-[10px] uppercase tracking-wide ${STYLES[confidenceLevel]} ${className ?? ""}`}
    >
      {LABELS[confidenceLevel]}
    </span>
  );
}
