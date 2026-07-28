"use client";

import { useRef } from "react";
import type { IngredientGroup, RecipeStep } from "@/lib/types/recipe";
import type { ValidationIssue } from "@/lib/admin/client";
import { fieldError, fieldErrorsWithPrefix } from "@/lib/admin/fieldError";
import { emptyStep } from "@/lib/admin/emptyDish";
import { TextField, NumberField, CheckboxRow } from "../ui/FormControls";
import { RepeatableList } from "../ui/RepeatableList";

interface StepsEditorProps {
  steps: RecipeStep[];
  ingredientGroups: IngredientGroup[];
  onChange: (steps: RecipeStep[]) => void;
  errors: ValidationIssue[];
}

export function StepsEditor({ steps, ingredientGroups, onChange, errors }: StepsEditorProps): React.JSX.Element {
  const ingredientOptions = ingredientGroups.flatMap((g) => g.items.map((item) => ({ id: item.id, name: item.name })));

  // Reorder/add/remove always renumbers so stepNumber tracks array position —
  // the contiguity rule from Section 4 is then automatically satisfied.
  const handleChange = (next: RecipeStep[]): void => {
    onChange(next.map((step, i) => ({ ...step, stepNumber: i + 1 })));
  };

  return (
    <div>
      <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Steps</span>
      {fieldError(errors, "steps") && <p className="mb-2 font-body text-xs text-paprika">{fieldError(errors, "steps")}</p>}
      <RepeatableList
        items={steps}
        onChange={handleChange}
        makeNew={() => emptyStep(steps.length + 1)}
        addLabel="Add step"
        emptyLabel="No steps yet."
        renderItem={(step, updateStep) => {
          const index = steps.indexOf(step);
          const stepErrors = fieldErrorsWithPrefix(errors, `steps[${index}]`);
          return (
            <div className="flex flex-col gap-3">
              <p className="font-meta text-xs text-ink/40">Step {step.stepNumber}</p>
              <TextField
                label="Title"
                value={step.title}
                onChange={(v) => updateStep({ ...step, title: v })}
                error={fieldError(stepErrors, `steps[${index}].title`)}
              />
              <StepInstructionField
                value={step.instruction}
                onChange={(v) => updateStep({ ...step, instruction: v })}
                ingredientOptions={ingredientOptions}
                error={fieldError(stepErrors, `steps[${index}].instruction`)}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <NumberField
                  label="Duration (minutes)"
                  value={step.durationMinutes}
                  onChange={(v) => updateStep({ ...step, durationMinutes: v })}
                  min={0}
                />
                <TextField label="Technique" value={step.technique} onChange={(v) => updateStep({ ...step, technique: v })} />
              </div>
              <TextField
                label="Visual cue"
                value={step.visualCue}
                onChange={(v) => updateStep({ ...step, visualCue: v })}
              />
              <TextField
                label="Common mistake"
                value={step.commonMistake}
                onChange={(v) => updateStep({ ...step, commonMistake: v })}
              />
              <HeatFields step={step} onChange={updateStep} />
            </div>
          );
        }}
      />
    </div>
  );
}

interface StepInstructionFieldProps {
  value: string;
  onChange: (value: string) => void;
  ingredientOptions: Array<{ id: string; name: string }>;
  error?: string;
}

function StepInstructionField({ value, onChange, ingredientOptions, error }: StepInstructionFieldProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertRef = (id: string): void => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${value} {${id}}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const token = `{${id}}`;
    onChange(`${value.slice(0, start)}${token}${value.slice(end)}`);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-meta text-xs uppercase tracking-wide text-ink/60">Instruction</span>
        {ingredientOptions.length > 0 && (
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) insertRef(e.target.value);
              e.target.value = "";
            }}
            className="border border-clay-line bg-parchment px-2 py-1 font-meta text-xs text-ink"
          >
            <option value="">Insert ingredient…</option>
            {ingredientOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{`{${opt.id}} ${opt.name}`}</option>
            ))}
          </select>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="resize-y border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric"
      />
      {error && <span className="font-body text-xs text-paprika">{error}</span>}
    </div>
  );
}

interface HeatFieldsProps {
  step: RecipeStep;
  onChange: (step: RecipeStep) => void;
}

function HeatFields({ step, onChange }: HeatFieldsProps): React.JSX.Element {
  const hasHeat = step.heat !== null;
  return (
    <div className="flex flex-col gap-2 border-t border-clay-line pt-3">
      <CheckboxRow
        label="Has heat info"
        checked={hasHeat}
        onChange={(checked) =>
          onChange({ ...step, heat: checked ? { level: "", flameNote: null, tempC: null } : null })
        }
      />
      {step.heat && (
        <div className="grid gap-2 sm:grid-cols-3">
          <TextField
            label="Heat level"
            value={step.heat.level}
            onChange={(v) => onChange({ ...step, heat: { ...step.heat!, level: v } })}
          />
          <TextField
            label="Flame note"
            value={step.heat.flameNote ?? ""}
            onChange={(v) => onChange({ ...step, heat: { ...step.heat!, flameNote: v || null } })}
          />
          <NumberField
            label="Temp (°C)"
            value={step.heat.tempC ?? NaN}
            onChange={(v) => onChange({ ...step, heat: { ...step.heat!, tempC: Number.isFinite(v) ? v : null } })}
          />
        </div>
      )}
    </div>
  );
}
