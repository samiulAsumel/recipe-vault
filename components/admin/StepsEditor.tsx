'use client';

import type { RecipeStep } from '@/types/recipe';

interface StepsEditorProps {
  steps: RecipeStep[];
  onChange: (steps: RecipeStep[]) => void;
}

function emptyStep(stepNumber: number): RecipeStep {
  return {
    stepNumber,
    title: '',
    instruction: '',
    durationMinutes: 0,
    heat: null,
    technique: '',
    visualCue: '',
    commonMistake: '',
  };
}

const inputClass =
  'w-full border border-clay-line bg-parchment px-3 py-1.5 text-sm text-ink focus-visible:border-turmeric';
const labelClass = 'flex flex-col gap-1 text-xs text-ink/70';

export function StepsEditor({ steps, onChange }: StepsEditorProps): React.ReactElement {
  function updateStep(index: number, patch: Partial<RecipeStep>): void {
    onChange(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }

  return (
    <div className="flex flex-col gap-6">
      <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Steps</span>

      {steps.map((step, index) => (
        // Steps are renumbered sequentially and only ever appended/removed, not reordered -
        // position is a reasonable key here for the same reason as the ingredient groups above.
        <div key={index} className="border border-clay-line p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ink/50">Step {step.stepNumber}</span>
            <button
              type="button"
              onClick={() =>
                onChange(
                  steps
                    .filter((_, i) => i !== index)
                    .map((s, i) => ({ ...s, stepNumber: i + 1 })),
                )
              }
              className="text-xs text-paprika hover:underline"
            >
              Remove step
            </button>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Title
              <input
                type="text"
                value={step.title}
                onChange={(event) => updateStep(index, { title: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Duration (minutes)
              <input
                type="number"
                value={step.durationMinutes}
                onChange={(event) => updateStep(index, { durationMinutes: Number(event.target.value) })}
                className={inputClass}
              />
            </label>
          </div>

          <label className={`mt-3 ${labelClass}`}>
            Instruction (use {'{ingredientId}'} to reference an ingredient, e.g. {'{0001}'})
            <textarea
              value={step.instruction}
              onChange={(event) => updateStep(index, { instruction: event.target.value })}
              rows={2}
              className={inputClass}
            />
          </label>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className={labelClass}>
              Technique
              <input
                type="text"
                value={step.technique}
                onChange={(event) => updateStep(index, { technique: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Visual cue
              <input
                type="text"
                value={step.visualCue}
                onChange={(event) => updateStep(index, { visualCue: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Common mistake
              <input
                type="text"
                value={step.commonMistake}
                onChange={(event) => updateStep(index, { commonMistake: event.target.value })}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-3 border-t border-clay-line pt-3">
            <label className="flex items-center gap-2 text-xs text-ink">
              <input
                type="checkbox"
                checked={step.heat !== null}
                onChange={(event) =>
                  updateStep(index, {
                    heat: event.target.checked ? { level: '', flameNote: '', tempC: null } : null,
                  })
                }
              />
              This step involves active heat
            </label>

            {step.heat ? (
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className={labelClass}>
                  Heat level
                  <input
                    type="text"
                    value={step.heat.level}
                    onChange={(event) => updateStep(index, { heat: { ...step.heat!, level: event.target.value } })}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Flame note
                  <input
                    type="text"
                    value={step.heat.flameNote}
                    onChange={(event) =>
                      updateStep(index, { heat: { ...step.heat!, flameNote: event.target.value } })
                    }
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Temp (°C, optional)
                  <input
                    type="number"
                    value={step.heat.tempC ?? ''}
                    onChange={(event) =>
                      updateStep(index, {
                        heat: {
                          ...step.heat!,
                          tempC: event.target.value ? Number(event.target.value) : null,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...steps, emptyStep(steps.length + 1)])}
        className="self-start border border-ink px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:border-turmeric"
      >
        + Add step
      </button>
    </div>
  );
}
