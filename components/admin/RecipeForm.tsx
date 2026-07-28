"use client";

import { useState } from "react";
import type { DishEntry } from "@/lib/types/recipe";
import { createDish, updateDish, AdminApiError, type ValidationIssue } from "@/lib/admin/client";
import { validateDish } from "@/lib/admin/validateDish";
import { emptyFullRecipeFields } from "@/lib/admin/emptyDish";
import { DiscoveryFields } from "./fields/DiscoveryFields";
import { PrepFields } from "./fields/PrepFields";
import { IngredientGroupsEditor } from "./fields/IngredientGroupsEditor";
import { StepsEditor } from "./fields/StepsEditor";
import { NotesFields } from "./fields/NotesFields";

const FULL_RECIPE_KEYS = [
  "baseServings",
  "headnote",
  "timing",
  "equipment",
  "miseEnPlace",
  "ingredientGroups",
  "steps",
  "chefTips",
  "donenessSummary",
  "platingNote",
  "storageNote",
  "substitutions",
  "regionalVariations",
  "nutritionEstimate",
] as const;

function sanitizeDish(dish: DishEntry): DishEntry {
  if (dish.fullRecipeAvailable) return dish;
  const clean = { ...dish };
  for (const key of FULL_RECIPE_KEYS) delete clean[key];
  return clean;
}

interface RecipeFormProps {
  mode: "create" | "edit";
  initialDish: DishEntry;
  countrySlug: string;
  expectedSha: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function RecipeForm({
  mode,
  initialDish,
  countrySlug,
  expectedSha,
  onSaved,
  onCancel,
}: RecipeFormProps): React.JSX.Element {
  const [dish, setDish] = useState<DishEntry>(initialDish);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [staleData, setStaleData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDiscoveryChange = (next: DishEntry): void => {
    if (next.fullRecipeAvailable && dish.ingredientGroups === undefined) {
      setDish({ ...emptyFullRecipeFields(), ...next });
    } else {
      setDish(next);
    }
  };

  const handleSave = async (): Promise<void> => {
    setSaveError(null);
    setStaleData(false);

    const candidate = sanitizeDish({ ...dish, id: `${dish.countrySlug}-${dish.slug}` });
    const clientIssues = validateDish(candidate);
    if (clientIssues.length > 0) {
      setIssues(clientIssues);
      return;
    }
    setIssues([]);
    setSaving(true);
    try {
      if (mode === "create") {
        await createDish(countrySlug, candidate, expectedSha);
      } else {
        await updateDish(countrySlug, initialDish.slug, candidate, expectedSha);
      }
      onSaved();
    } catch (err) {
      if (err instanceof AdminApiError) {
        if (err.errorCode === "validation_error" && err.details) setIssues(err.details);
        else if (err.errorCode === "stale_data") setStaleData(true);
        else if (err.errorCode === "duplicate_dish") setIssues([{ field: "slug", message: err.message }]);
        else setSaveError(err.message);
      } else {
        setSaveError("Could not save. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 border border-clay-line p-6">
      <DiscoveryFields dish={dish} onChange={handleDiscoveryChange} errors={issues} countryLocked={mode === "edit"} />

      {dish.fullRecipeAvailable && (
        <>
          <hr className="border-clay-line" />
          <PrepFields dish={dish} onChange={setDish} errors={issues} />
          <IngredientGroupsEditor
            groups={dish.ingredientGroups ?? []}
            onChange={(groups) => setDish({ ...dish, ingredientGroups: groups })}
            errors={issues}
          />
          <StepsEditor
            steps={dish.steps ?? []}
            ingredientGroups={dish.ingredientGroups ?? []}
            onChange={(steps) => setDish({ ...dish, steps })}
            errors={issues}
          />
          <NotesFields dish={dish} onChange={setDish} errors={issues} />
        </>
      )}

      {staleData && (
        <p className="font-body text-sm text-paprika">
          This country&apos;s data changed elsewhere since it was loaded. Cancel and reopen this dish to get the
          latest version before saving.
        </p>
      )}
      {saveError && <p className="font-body text-sm text-paprika">{saveError}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-turmeric px-4 py-2 font-body text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-clay-line px-4 py-2 font-body text-sm text-ink/70 hover:border-ink focus-visible:outline-2 focus-visible:outline-turmeric"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
