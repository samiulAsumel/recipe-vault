'use client';

import type { IngredientGroup, IngredientItem } from '@/types/recipe';

interface IngredientGroupsEditorProps {
  groups: IngredientGroup[];
  onChange: (groups: IngredientGroup[]) => void;
}

function emptyItem(): IngredientItem {
  return {
    id: crypto.randomUUID().slice(0, 8),
    name: '',
    amount: 0,
    unit: null,
    prepNote: null,
    pantryStaple: false,
  };
}

const inputClass =
  'border border-clay-line bg-parchment px-2 py-1.5 text-sm text-ink focus-visible:border-turmeric';

export function IngredientGroupsEditor({ groups, onChange }: IngredientGroupsEditorProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Ingredient groups</span>

      {groups.map((group, groupIndex) => (
        // Groups have no id of their own in the schema; using position is a known compromise -
        // acceptable here since groups are only appended/removed, never reordered by drag.
        <div key={groupIndex} className="border border-clay-line p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={group.groupName}
              placeholder="Group name (e.g. For the marinade)"
              onChange={(event) =>
                onChange(
                  groups.map((g, i) => (i === groupIndex ? { ...g, groupName: event.target.value } : g)),
                )
              }
              className={`flex-1 font-semibold ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => onChange(groups.filter((_, i) => i !== groupIndex))}
              className="border border-clay-line px-2 text-xs text-paprika hover:border-paprika"
            >
              Remove group
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {group.items.map((item, itemIndex) => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input
                  type="number"
                  value={item.amount}
                  onChange={(event) => {
                    const items = group.items.map((it, i) =>
                      i === itemIndex ? { ...it, amount: Number(event.target.value) } : it,
                    );
                    onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
                  }}
                  placeholder="Amount"
                  className={`col-span-2 ${inputClass}`}
                />
                <input
                  type="text"
                  value={item.unit ?? ''}
                  onChange={(event) => {
                    const items = group.items.map((it, i) =>
                      i === itemIndex ? { ...it, unit: event.target.value || null } : it,
                    );
                    onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
                  }}
                  placeholder="Unit"
                  className={`col-span-2 ${inputClass}`}
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(event) => {
                    const items = group.items.map((it, i) =>
                      i === itemIndex ? { ...it, name: event.target.value } : it,
                    );
                    onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
                  }}
                  placeholder="Ingredient name"
                  className={`col-span-4 ${inputClass}`}
                />
                <input
                  type="text"
                  value={item.prepNote ?? ''}
                  onChange={(event) => {
                    const items = group.items.map((it, i) =>
                      i === itemIndex ? { ...it, prepNote: event.target.value || null } : it,
                    );
                    onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
                  }}
                  placeholder="Prep note"
                  className={`col-span-3 ${inputClass}`}
                />
                <label className="col-span-1 flex items-center justify-center gap-1 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={item.pantryStaple}
                    onChange={(event) => {
                      const items = group.items.map((it, i) =>
                        i === itemIndex ? { ...it, pantryStaple: event.target.checked } : it,
                      );
                      onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
                    }}
                  />
                  Pantry
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const items = group.items.filter((_, i) => i !== itemIndex);
                    onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
                  }}
                  className="col-span-12 self-start text-xs text-paprika hover:underline"
                >
                  Remove ingredient
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const items = [...group.items, emptyItem()];
                onChange(groups.map((g, i) => (i === groupIndex ? { ...g, items } : g)));
              }}
              className="self-start border border-clay-line px-3 py-1 font-mono text-xs uppercase tracking-widest hover:border-turmeric"
            >
              + Add ingredient
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...groups, { groupName: '', items: [] }])}
        className="self-start border border-ink px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:border-turmeric"
      >
        + Add ingredient group
      </button>
    </div>
  );
}
