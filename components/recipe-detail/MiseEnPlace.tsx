interface MiseEnPlaceProps {
  items: string[];
  equipment: string[];
}

/** Section 5: mise-en-place checklist, part of the sticky ingredients sidebar. Checkboxes are
 * uncontrolled - purely a visual "what have I done" aid, nothing to persist. */
export function MiseEnPlace({ items, equipment }: MiseEnPlaceProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      {equipment.length > 0 && (
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink/60">Equipment</h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-ink">
            {equipment.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-ink/60">Mise en place</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  className="mt-1 accent-[var(--accent-1)]"
                  aria-label={item}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
