'use client';

import { useState } from 'react';

interface StringListEditorProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

interface Row {
  id: string;
  value: string;
}

/** Reused for every free-form string[] field (occasion, pairedDrink, equipment, miseEnPlace,
 * chefTips, regionalVariations) - one editor, six call sites. Rows carry their own generated
 * id (not array index) as the React key, so removing a middle row doesn't reshuffle the
 * remaining inputs' identity out from under their own in-progress edits. */
export function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
}: StringListEditorProps): React.ReactElement {
  const [rows, setRows] = useState<Row[]>(() => values.map((value) => ({ id: crypto.randomUUID(), value })));

  function updateRows(next: Row[]): void {
    setRows(next);
    onChange(next.map((row) => row.value));
  }

  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">{label}</span>
      <div className="mt-2 flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-2">
            <input
              type="text"
              value={row.value}
              placeholder={placeholder}
              onChange={(event) =>
                updateRows(rows.map((r) => (r.id === row.id ? { ...r, value: event.target.value } : r)))
              }
              className="flex-1 border border-clay-line bg-parchment px-3 py-1.5 text-sm text-ink focus-visible:border-turmeric"
            />
            <button
              type="button"
              onClick={() => updateRows(rows.filter((r) => r.id !== row.id))}
              className="border border-clay-line px-2 text-xs text-paprika hover:border-paprika"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => updateRows([...rows, { id: crypto.randomUUID(), value: '' }])}
          className="self-start border border-clay-line px-3 py-1 font-mono text-xs uppercase tracking-widest hover:border-turmeric"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
