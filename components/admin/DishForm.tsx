'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveDishAction } from '@/app/admin/actions';
import { IngredientGroupsEditor } from '@/components/admin/IngredientGroupsEditor';
import { StepsEditor } from '@/components/admin/StepsEditor';
import { StringListEditor } from '@/components/admin/StringListEditor';
import { SubstitutionsEditor } from '@/components/admin/SubstitutionsEditor';
import {
  CONTINENT_LABELS,
  CONTINENT_SLUGS,
  DIETARY_KEYS,
  DIETARY_LABELS,
  MEAL_TIME_LABELS,
  MEAL_TIME_SLUGS,
} from '@/lib/constants';
import type { ConfidenceLevel, Difficulty, FullRecipe, Recipe } from '@/types/recipe';

interface DishFormProps {
  initialRecipe: Recipe | null;
  previousCountrySlug?: string;
}

/** FullRecipe's fields are a strict superset of DiscoveryRecipe's, so they double as the form's
 * internal draft shape regardless of the fullRecipeAvailable toggle - the extra fields just sit
 * unused (and hidden) until the toggle is checked. `fullRecipeAvailable` itself is widened from
 * FullRecipe's literal `true` back to `boolean`, since the draft must represent both states. */
type Draft = Omit<FullRecipe, 'fullRecipeAvailable'> & { fullRecipeAvailable: boolean };

function blankDraft(): Draft {
  return {
    id: '',
    slug: '',
    name: '',
    continent: CONTINENT_LABELS.asia,
    continentSlug: 'asia',
    country: '',
    countrySlug: '',
    mealTime: [],
    occasion: [],
    streetFood: false,
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      eggFree: false,
      nutFree: false,
      lowCarb: false,
      highProtein: false,
    },
    difficulty: 'Medium',
    totalTimeMinutes: 0,
    historicNote: '',
    whenEaten: '',
    pairedDrink: [],
    confidenceLevel: 'medium',
    shortDescription: '',
    heroImage: '',
    category: '',
    fullRecipeAvailable: false,
    baseServings: 4,
    headnote: '',
    timing: { prepMinutes: 0, marinateMinutes: 0, activeCookMinutes: 0, restMinutes: 0, totalMinutes: 0 },
    equipment: [],
    miseEnPlace: [],
    ingredientGroups: [],
    steps: [],
    chefTips: [],
    donenessSummary: '',
    platingNote: '',
    storageNote: '',
    substitutions: [],
    regionalVariations: [],
    nutritionEstimate: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  };
}

function toDraft(recipe: Recipe | null): Draft {
  if (!recipe) return blankDraft();
  if (recipe.fullRecipeAvailable) return recipe;
  return { ...blankDraft(), ...recipe, fullRecipeAvailable: false };
}

/** Strips the draft back down to the DiscoveryRecipe field set when fullRecipeAvailable is
 * off, so a discovery-only save never writes half-filled full-recipe fields to GitHub. */
function toRecipe(draft: Draft): Recipe {
  if (draft.fullRecipeAvailable) return draft;

  return {
    id: draft.id,
    slug: draft.slug,
    name: draft.name,
    continent: draft.continent,
    continentSlug: draft.continentSlug,
    country: draft.country,
    countrySlug: draft.countrySlug,
    mealTime: draft.mealTime,
    occasion: draft.occasion,
    streetFood: draft.streetFood,
    dietary: draft.dietary,
    difficulty: draft.difficulty,
    totalTimeMinutes: draft.totalTimeMinutes,
    historicNote: draft.historicNote,
    whenEaten: draft.whenEaten,
    pairedDrink: draft.pairedDrink,
    confidenceLevel: draft.confidenceLevel,
    shortDescription: draft.shortDescription,
    heroImage: draft.heroImage,
    category: draft.category,
    fullRecipeAvailable: false,
  };
}

const inputClass =
  'w-full border border-clay-line bg-parchment px-3 py-1.5 text-sm text-ink focus-visible:border-turmeric';
const labelClass = 'flex flex-col gap-1 text-xs text-ink/70';
const sectionHeadingClass = 'font-mono text-xs uppercase tracking-widest text-ink/60';

export function DishForm({ initialRecipe, previousCountrySlug }: DishFormProps): React.ReactElement {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(initialRecipe));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(fields: Partial<Draft>): void {
    setDraft((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const result = await saveDishAction(toRecipe(draft), previousCountrySlug);
    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }

    router.push(`/admin?tab=recipes&country=${draft.countrySlug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error ? <p className="border border-paprika px-3 py-2 text-sm text-paprika">{error}</p> : null}

      <section className="flex flex-col gap-3">
        <h2 className={sectionHeadingClass}>Identity</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            Dish ID (slug-like, e.g. bd-kacchi-biryani)
            <input
              type="text"
              value={draft.id}
              onChange={(event) => patch({ id: event.target.value })}
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Slug (URL, e.g. kacchi-biryani)
            <input
              type="text"
              value={draft.slug}
              onChange={(event) => patch({ slug: event.target.value })}
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Name
            <input
              type="text"
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Continent
            <select
              value={draft.continentSlug}
              onChange={(event) =>
                patch({
                  continentSlug: event.target.value,
                  continent: CONTINENT_LABELS[event.target.value as (typeof CONTINENT_SLUGS)[number]],
                })
              }
              className={inputClass}
            >
              {CONTINENT_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {CONTINENT_LABELS[slug]}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Country
            <input
              type="text"
              value={draft.country}
              onChange={(event) => patch({ country: event.target.value })}
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Country slug (determines recipes/{'{slug}'}.json)
            <input
              type="text"
              value={draft.countrySlug}
              onChange={(event) => patch({ countrySlug: event.target.value })}
              required
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={sectionHeadingClass}>Classification</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            Category
            <input
              type="text"
              value={draft.category}
              onChange={(event) => patch({ category: event.target.value })}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Difficulty
            <select
              value={draft.difficulty}
              onChange={(event) => patch({ difficulty: event.target.value as Difficulty })}
              className={inputClass}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
          <label className={labelClass}>
            Confidence level
            <select
              value={draft.confidenceLevel}
              onChange={(event) => patch({ confidenceLevel: event.target.value as ConfidenceLevel })}
              className={inputClass}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className={labelClass}>
            Total time (minutes)
            <input
              type="number"
              value={draft.totalTimeMinutes}
              onChange={(event) => patch({ totalTimeMinutes: Number(event.target.value) })}
              className={inputClass}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={draft.streetFood}
              onChange={(event) => patch({ streetFood: event.target.checked })}
            />
            Street food
          </label>
        </div>

        <div>
          <span className={sectionHeadingClass}>Meal time</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {MEAL_TIME_SLUGS.map((slug) => {
              const label = MEAL_TIME_LABELS[slug];
              return (
                <label key={slug} className="flex items-center gap-1.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={draft.mealTime.includes(label)}
                    onChange={(event) =>
                      patch({
                        mealTime: event.target.checked
                          ? [...draft.mealTime, label]
                          : draft.mealTime.filter((value) => value !== label),
                      })
                    }
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>

        <StringListEditor
          label="Occasion"
          values={draft.occasion}
          onChange={(occasion) => patch({ occasion })}
          placeholder="e.g. Festival"
        />

        <div>
          <span className={sectionHeadingClass}>Dietary</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {DIETARY_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-1.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.dietary[key]}
                  onChange={(event) => patch({ dietary: { ...draft.dietary, [key]: event.target.checked } })}
                />
                {DIETARY_LABELS[key]}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={sectionHeadingClass}>Discovery content</h2>
        <label className={labelClass}>
          Short description
          <textarea
            value={draft.shortDescription}
            onChange={(event) => patch({ shortDescription: event.target.value })}
            rows={2}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Historic note
          <textarea
            value={draft.historicNote}
            onChange={(event) => patch({ historicNote: event.target.value })}
            rows={2}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          When eaten
          <input
            type="text"
            value={draft.whenEaten}
            onChange={(event) => patch({ whenEaten: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Hero image path (e.g. /images/bangladesh/kacchi-biryani-1.jpg)
          <input
            type="text"
            value={draft.heroImage}
            onChange={(event) => patch({ heroImage: event.target.value })}
            className={inputClass}
          />
        </label>
        <StringListEditor
          label="Paired drink"
          values={draft.pairedDrink}
          onChange={(pairedDrink) => patch({ pairedDrink })}
        />
      </section>

      <section className="border-t border-clay-line pt-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={draft.fullRecipeAvailable}
            onChange={(event) => patch({ fullRecipeAvailable: event.target.checked })}
          />
          Full recipe available (ingredients, steps, nutrition below)
        </label>
      </section>

      {draft.fullRecipeAvailable ? (
        <section className="flex flex-col gap-6 border-t border-clay-line pt-6">
          <h2 className={sectionHeadingClass}>Full recipe</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Base servings
              <input
                type="number"
                value={draft.baseServings}
                onChange={(event) => patch({ baseServings: Number(event.target.value) })}
                className={inputClass}
              />
            </label>
          </div>

          <label className={labelClass}>
            Headnote
            <textarea
              value={draft.headnote}
              onChange={(event) => patch({ headnote: event.target.value })}
              rows={2}
              className={inputClass}
            />
          </label>

          <div>
            <span className={sectionHeadingClass}>Timing (minutes)</span>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(['prepMinutes', 'marinateMinutes', 'activeCookMinutes', 'restMinutes', 'totalMinutes'] as const).map(
                (field) => (
                  <label key={field} className={labelClass}>
                    {field}
                    <input
                      type="number"
                      value={draft.timing[field]}
                      onChange={(event) =>
                        patch({ timing: { ...draft.timing, [field]: Number(event.target.value) } })
                      }
                      className={inputClass}
                    />
                  </label>
                ),
              )}
            </div>
          </div>

          <StringListEditor label="Equipment" values={draft.equipment} onChange={(equipment) => patch({ equipment })} />
          <StringListEditor
            label="Mise en place"
            values={draft.miseEnPlace}
            onChange={(miseEnPlace) => patch({ miseEnPlace })}
          />

          <IngredientGroupsEditor
            groups={draft.ingredientGroups}
            onChange={(ingredientGroups) => patch({ ingredientGroups })}
          />

          <StepsEditor steps={draft.steps} onChange={(steps) => patch({ steps })} />

          <StringListEditor label="Chef tips" values={draft.chefTips} onChange={(chefTips) => patch({ chefTips })} />

          <label className={labelClass}>
            Doneness summary
            <textarea
              value={draft.donenessSummary}
              onChange={(event) => patch({ donenessSummary: event.target.value })}
              rows={2}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Plating note
            <textarea
              value={draft.platingNote}
              onChange={(event) => patch({ platingNote: event.target.value })}
              rows={2}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Storage note
            <textarea
              value={draft.storageNote}
              onChange={(event) => patch({ storageNote: event.target.value })}
              rows={2}
              className={inputClass}
            />
          </label>

          <SubstitutionsEditor
            substitutions={draft.substitutions}
            onChange={(substitutions) => patch({ substitutions })}
          />
          <StringListEditor
            label="Regional variations"
            values={draft.regionalVariations}
            onChange={(regionalVariations) => patch({ regionalVariations })}
          />

          <div>
            <span className={sectionHeadingClass}>Nutrition estimate (per serving)</span>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['calories', 'proteinG', 'carbsG', 'fatG'] as const).map((field) => (
                <label key={field} className={labelClass}>
                  {field}
                  <input
                    type="number"
                    value={draft.nutritionEstimate[field]}
                    onChange={(event) =>
                      patch({
                        nutritionEstimate: {
                          ...draft.nutritionEstimate,
                          [field]: Number(event.target.value),
                        },
                      })
                    }
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="self-start border border-ink bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-parchment transition-colors hover:border-turmeric hover:bg-turmeric disabled:opacity-50"
      >
        {isSaving ? 'Saving…' : 'Save dish'}
      </button>
    </form>
  );
}
