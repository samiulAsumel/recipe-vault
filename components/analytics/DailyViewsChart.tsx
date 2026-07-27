import type { DailyCount } from '@/lib/analytics';

interface DailyViewsChartProps {
  data: DailyCount[];
}

const WIDTH = 600;
const HEIGHT = 160;
const PADDING_X = 12;
const PADDING_Y = 16;

/** Section 10: "unique visitors per day (last 30 days), as a simple line chart." Single
 * series, so no legend box (dataviz skill: the title already names what's plotted) - just a
 * 2px round-joined line, recessive hairline gridlines, and one direct label at the end point
 * (today's value), the only one worth labelling directly. Native <title> tooltips stand in for
 * a full interactive crosshair, which felt like more chart than an internal admin panel needs. */
export function DailyViewsChart({ data }: DailyViewsChartProps): React.ReactElement {
  const maxCount = Math.max(...data.map((entry) => entry.count), 1);
  const plotWidth = WIDTH - PADDING_X * 2;
  const plotHeight = HEIGHT - PADDING_Y * 2;

  const points = data.map((entry, index) => ({
    ...entry,
    x: PADDING_X + (data.length > 1 ? (index / (data.length - 1)) * plotWidth : 0),
    y: PADDING_Y + plotHeight - (entry.count / maxCount) * plotHeight,
  }));

  const pathD = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const lastPoint = points[points.length - 1];
  const gridLineFractions = [0, 0.5, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Daily page views over the last ${data.length} days`}
        className="w-full"
      >
        {gridLineFractions.map((fraction) => (
          <line
            key={fraction}
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={PADDING_Y + plotHeight * (1 - fraction)}
            y2={PADDING_Y + plotHeight * (1 - fraction)}
            stroke="var(--color-clay-line)"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        ))}

        <path
          d={pathD}
          fill="none"
          stroke="var(--color-turmeric)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <circle key={point.date} cx={point.x} cy={point.y} r={6} fill="transparent">
            <title>{`${point.date}: ${point.count} view${point.count === 1 ? '' : 's'}`}</title>
          </circle>
        ))}

        {lastPoint ? (
          <>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={4}
              fill="var(--color-turmeric)"
              stroke="var(--color-parchment)"
              strokeWidth={2}
            />
            <text
              x={Math.min(lastPoint.x, WIDTH - 24)}
              y={Math.max(lastPoint.y - 10, 12)}
              textAnchor="end"
              className="font-mono"
              fontSize={11}
              fill="var(--color-ink)"
            >
              {lastPoint.count}
            </text>
          </>
        ) : null}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-ink/50">
        <span>{data[0]?.date}</span>
        <span>{lastPoint?.date}</span>
      </div>
    </div>
  );
}
