import type { DishEntry, NutritionEstimate, Substitution } from "@/lib/types/recipe";
import type { ValidationIssue } from "@/lib/admin/client";
import { fieldError } from "@/lib/admin/fieldError";
import { TextField, TextArea, NumberField } from "../ui/FormControls";
import { RepeatableList } from "../ui/RepeatableList";

interface NotesFieldsProps {
  dish: DishEntry;
  onChange: (dish: DishEntry) => void;
  errors: ValidationIssue[];
}

const stringListInputClass =
  "w-full border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric";

export function NotesFields({ dish, onChange, errors }: NotesFieldsProps): React.JSX.Element {
  const nutrition: NutritionEstimate = dish.nutritionEstimate ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Chef&apos;s tips</span>
        <RepeatableList
          items={dish.chefTips ?? []}
          onChange={(values) => onChange({ ...dish, chefTips: values })}
          makeNew={() => ""}
          addLabel="Add tip"
          emptyLabel="No tips yet."
          renderItem={(value, update) => (
            <input type="text" value={value} onChange={(e) => update(e.target.value)} className={stringListInputClass} />
          )}
        />
      </div>

      <TextArea
        label="Doneness summary"
        value={dish.donenessSummary ?? ""}
        onChange={(v) => onChange({ ...dish, donenessSummary: v })}
        error={fieldError(errors, "donenessSummary")}
      />
      <TextArea
        label="Plating note"
        value={dish.platingNote ?? ""}
        onChange={(v) => onChange({ ...dish, platingNote: v })}
      />
      <TextArea
        label="Storage note"
        value={dish.storageNote ?? ""}
        onChange={(v) => onChange({ ...dish, storageNote: v })}
      />

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Substitutions</span>
        <RepeatableList
          items={dish.substitutions ?? []}
          onChange={(values) => onChange({ ...dish, substitutions: values })}
          makeNew={(): Substitution => ({ original: "", swap: "", impact: "" })}
          addLabel="Add substitution"
          emptyLabel="No substitutions yet."
          renderItem={(sub, update) => (
            <div className="grid gap-2 sm:grid-cols-3">
              <TextField label="Original" value={sub.original} onChange={(v) => update({ ...sub, original: v })} />
              <TextField label="Swap" value={sub.swap} onChange={(v) => update({ ...sub, swap: v })} />
              <TextField label="Impact" value={sub.impact} onChange={(v) => update({ ...sub, impact: v })} />
            </div>
          )}
        />
      </div>

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Regional variations</span>
        <RepeatableList
          items={dish.regionalVariations ?? []}
          onChange={(values) => onChange({ ...dish, regionalVariations: values })}
          makeNew={() => ""}
          addLabel="Add variation"
          emptyLabel="No variations yet."
          renderItem={(value, update) => (
            <input type="text" value={value} onChange={(e) => update(e.target.value)} className={stringListInputClass} />
          )}
        />
      </div>

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">
          Nutrition estimate (per base serving)
        </span>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <NumberField
            label="Calories"
            value={nutrition.calories}
            onChange={(v) => onChange({ ...dish, nutritionEstimate: { ...nutrition, calories: v } })}
            min={0}
          />
          <NumberField
            label="Protein (g)"
            value={nutrition.proteinG}
            onChange={(v) => onChange({ ...dish, nutritionEstimate: { ...nutrition, proteinG: v } })}
            min={0}
          />
          <NumberField
            label="Carbs (g)"
            value={nutrition.carbsG}
            onChange={(v) => onChange({ ...dish, nutritionEstimate: { ...nutrition, carbsG: v } })}
            min={0}
          />
          <NumberField
            label="Fat (g)"
            value={nutrition.fatG}
            onChange={(v) => onChange({ ...dish, nutritionEstimate: { ...nutrition, fatG: v } })}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
