"use client";

import { useRef, useState } from "react";

interface RepeatableListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  renderItem: (item: T, update: (next: T) => void) => React.ReactNode;
  addLabel: string;
  emptyLabel?: string;
}

/**
 * Add/remove/reorder editor shared by every repeatable field in the recipe
 * form (ingredient groups, ingredient items, steps, equipment, mise-en-place,
 * chef's tips, substitutions, regional variations).
 *
 * Keys are assigned once per row and only touched by this component's own
 * add/remove/move handlers — never derived from array index or item content,
 * since most of these rows (steps, groups) have no natural stable id. This
 * means a parent that swaps in a *different* items array from the outside
 * (e.g. switching which dish is being edited) should remount this component
 * with a `key` prop rather than relying on it to resync — RecipeForm does
 * this by keying the whole form on the dish slug.
 */
export function RepeatableList<T>({
  items,
  onChange,
  makeNew,
  renderItem,
  addLabel,
  emptyLabel,
}: RepeatableListProps<T>): React.JSX.Element {
  const nextKeyRef = useRef(items.length);
  const [rowKeys, setRowKeys] = useState<number[]>(() => Array.from({ length: items.length }, (_, i) => i));

  const add = (): void => {
    onChange([...items, makeNew()]);
    setRowKeys((keys) => [...keys, nextKeyRef.current++]);
  };

  const remove = (index: number): void => {
    onChange(items.filter((_, i) => i !== index));
    setRowKeys((keys) => keys.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
    onChange(nextItems);
    setRowKeys((keys) => {
      const next = [...keys];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && emptyLabel && <p className="font-body text-sm text-ink/50">{emptyLabel}</p>}
      {items.map((item, index) => (
        <div key={rowKeys[index]} className="border border-clay-line p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="border border-clay-line px-2 py-0.5 text-xs text-ink/70 hover:border-ink disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
                className="border border-clay-line px-2 py-0.5 text-xs text-ink/70 hover:border-ink disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="font-meta text-xs text-paprika hover:underline"
            >
              Remove
            </button>
          </div>
          {renderItem(item, (next) => {
            const nextItems = [...items];
            nextItems[index] = next;
            onChange(nextItems);
          })}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start border border-clay-line px-3 py-1 font-body text-sm text-ink/70 hover:border-ink focus-visible:outline-2 focus-visible:outline-turmeric"
      >
        + {addLabel}
      </button>
    </div>
  );
}
