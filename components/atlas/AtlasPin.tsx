import type { ConfidenceLevel } from "@/lib/types/recipe";

const CONFIDENCE_TICKS: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

interface AtlasPinProps {
  /** Omit for a purely decorative pin (e.g. the home hero) with no data ticks. */
  confidenceLevel?: ConfidenceLevel;
  /** True when the dish carries occasion tags or is a street-food entry. */
  hasOccasion?: boolean;
  /** Pin height in px — the tick marks and occasion dot scale with it. */
  size?: number;
  className?: string;
}

export function AtlasPin({
  confidenceLevel,
  hasOccasion,
  size = 22,
  className,
}: AtlasPinProps): React.JSX.Element {
  const ticks = confidenceLevel ? CONFIDENCE_TICKS[confidenceLevel] : 0;
  const tickWidth = Math.max(2, Math.round(size * 0.09));

  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className ?? ""}`}
      aria-hidden={confidenceLevel === undefined && hasOccasion === undefined}
      role={confidenceLevel !== undefined ? "img" : undefined}
      aria-label={
        confidenceLevel !== undefined ? `Confidence: ${confidenceLevel}` : undefined
      }
    >
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 24 32"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M12 1C5.925 1 1 5.925 1 12c0 8.5 11 18.5 11 18.5S23 20.5 23 12c0-6.075-4.925-11-11-11z"
          fill="var(--accent-1)"
          stroke="var(--ink)"
          strokeWidth="1"
        />
        {hasOccasion !== undefined && (
          <circle
            cx="12"
            cy="12"
            r="3.5"
            fill={hasOccasion ? "var(--parchment)" : "none"}
            stroke="var(--parchment)"
            strokeWidth="1.5"
          />
        )}
      </svg>
      {ticks > 0 && (
        <span className="flex items-end gap-[2px]" style={{ height: size * 0.6 }}>
          {[1, 2, 3].map((tick) => (
            <span
              key={tick}
              style={{
                width: tickWidth,
                height: tick <= ticks ? "100%" : "35%",
                backgroundColor: tick <= ticks ? "var(--accent-1)" : "var(--clay-line)",
              }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
