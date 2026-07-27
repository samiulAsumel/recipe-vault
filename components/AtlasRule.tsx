/** Section 2 atlas-plate header treatment: "a thin horizontal rule with small tick marks
 * (like a map scale bar, not a stock map graphic)". */
export function AtlasRule(): React.ReactElement {
  return (
    <div className="relative h-3 w-full" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-px bg-clay-line" />
      <div
        className="absolute inset-x-0 bottom-0 h-3"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, var(--color-clay-line) 0 1px, transparent 1px 24px)',
        }}
      />
    </div>
  );
}
