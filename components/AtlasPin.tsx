import type { ConfidenceLevel } from '@/types/recipe';

interface AtlasPinProps {
  confidenceLevel: ConfidenceLevel;
  occasion?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CONFIDENCE_TICKS: Record<ConfidenceLevel, number> = { low: 1, medium: 2, high: 3 };

const SIZE_CLASSES: Record<NonNullable<AtlasPinProps['size']>, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-16 w-16',
};

/** Section 2 signature element: a pin/waypoint badge showing continent accent (inherited from
 * the ancestor's `data-region`), a confidence-level tick, and (optionally) the occasion label. */
export function AtlasPin({ confidenceLevel, occasion, size = 'md' }: AtlasPinProps): React.ReactElement {
  const filledTicks = CONFIDENCE_TICKS[confidenceLevel];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`relative ${SIZE_CLASSES[size]} shrink-0 -rotate-45 rounded-[50%_50%_50%_0] bg-[var(--accent-1)]`}
        role="img"
        aria-label={`Confidence: ${confidenceLevel}`}
      >
        <span className="absolute inset-0 flex rotate-45 items-center justify-center gap-[2px]">
          {[0, 1, 2].map((tick) => (
            <span
              key={tick}
              className={`h-2 w-[2px] rounded-full ${
                tick < filledTicks ? 'bg-parchment' : 'bg-parchment/30'
              }`}
            />
          ))}
        </span>
      </span>
      {occasion ? (
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink/60">{occasion}</span>
      ) : null}
    </div>
  );
}
