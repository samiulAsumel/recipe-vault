'use client';

import type { Substitution } from '@/types/recipe';

interface SubstitutionsEditorProps {
  substitutions: Substitution[];
  onChange: (substitutions: Substitution[]) => void;
}

const inputClass =
  'border border-clay-line bg-parchment px-2 py-1.5 text-sm text-ink focus-visible:border-turmeric';

export function SubstitutionsEditor({ substitutions, onChange }: SubstitutionsEditorProps): React.ReactElement {
  function updateRow(index: number, patch: Partial<Substitution>): void {
    onChange(substitutions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Substitutions</span>
      <div className="mt-2 flex flex-col gap-2">
        {substitutions.map((row, index) => (
          <div key={index} className="grid grid-cols-12 gap-2">
            <input
              type="text"
              value={row.original}
              placeholder="Original"
              onChange={(event) => updateRow(index, { original: event.target.value })}
              className={`col-span-3 ${inputClass}`}
            />
            <input
              type="text"
              value={row.swap}
              placeholder="Swap"
              onChange={(event) => updateRow(index, { swap: event.target.value })}
              className={`col-span-3 ${inputClass}`}
            />
            <input
              type="text"
              value={row.impact}
              placeholder="Impact"
              onChange={(event) => updateRow(index, { impact: event.target.value })}
              className={`col-span-5 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => onChange(substitutions.filter((_, i) => i !== index))}
              className="col-span-1 text-xs text-paprika hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...substitutions, { original: '', swap: '', impact: '' }])}
          className="self-start border border-clay-line px-3 py-1 font-mono text-xs uppercase tracking-widest hover:border-turmeric"
        >
          + Add substitution
        </button>
      </div>
    </div>
  );
}
