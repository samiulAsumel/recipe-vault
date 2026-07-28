import type { DishEntry, Timing } from "@/lib/types/recipe";
import type { ValidationIssue } from "@/lib/admin/client";
import { fieldError } from "@/lib/admin/fieldError";
import { NumberField, TextArea } from "../ui/FormControls";
import { RepeatableList } from "../ui/RepeatableList";

interface PrepFieldsProps {
  dish: DishEntry;
  onChange: (dish: DishEntry) => void;
  errors: ValidationIssue[];
}

const stringListInputClass =
  "w-full border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric";

export function PrepFields({ dish, onChange, errors }: PrepFieldsProps): React.JSX.Element {
  const timing: Timing = dish.timing ?? {
    prepMinutes: 0,
    marinateMinutes: 0,
    activeCookMinutes: 0,
    restMinutes: 0,
    totalMinutes: 0,
  };

  const setTiming = (key: keyof Timing, value: number): void => {
    onChange({ ...dish, timing: { ...timing, [key]: value } });
  };

  return (
    <div className="flex flex-col gap-6">
      <NumberField
        label="Base servings"
        value={dish.baseServings ?? 0}
        onChange={(v) => onChange({ ...dish, baseServings: v })}
        error={fieldError(errors, "baseServings")}
        min={1}
      />

      <TextArea
        label="Headnote"
        value={dish.headnote ?? ""}
        onChange={(v) => onChange({ ...dish, headnote: v })}
        error={fieldError(errors, "headnote")}
      />

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Timing (minutes)</span>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <NumberField label="Prep" value={timing.prepMinutes} onChange={(v) => setTiming("prepMinutes", v)} min={0} />
          <NumberField
            label="Marinate"
            value={timing.marinateMinutes}
            onChange={(v) => setTiming("marinateMinutes", v)}
            min={0}
          />
          <NumberField
            label="Active cook"
            value={timing.activeCookMinutes}
            onChange={(v) => setTiming("activeCookMinutes", v)}
            min={0}
          />
          <NumberField label="Rest" value={timing.restMinutes} onChange={(v) => setTiming("restMinutes", v)} min={0} />
          <NumberField label="Total" value={timing.totalMinutes} onChange={(v) => setTiming("totalMinutes", v)} min={0} />
        </div>
      </div>

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Equipment</span>
        <RepeatableList
          items={dish.equipment ?? []}
          onChange={(values) => onChange({ ...dish, equipment: values })}
          makeNew={() => ""}
          addLabel="Add equipment"
          emptyLabel="No equipment listed yet."
          renderItem={(value, update) => (
            <input type="text" value={value} onChange={(e) => update(e.target.value)} className={stringListInputClass} />
          )}
        />
      </div>

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Mise en place</span>
        <RepeatableList
          items={dish.miseEnPlace ?? []}
          onChange={(values) => onChange({ ...dish, miseEnPlace: values })}
          makeNew={() => ""}
          addLabel="Add mise en place step"
          emptyLabel="Nothing listed yet."
          renderItem={(value, update) => (
            <input type="text" value={value} onChange={(e) => update(e.target.value)} className={stringListInputClass} />
          )}
        />
      </div>
    </div>
  );
}
