"use client";

import { useEffect, useState } from "react";
import type { CountrySummary, DishEntry } from "@/lib/types/recipe";
import { CONTINENTS } from "@/lib/constants";
import { listCountries, getCountryDishes, updateDish, deleteDish, AdminApiError } from "@/lib/admin/client";
import { emptyDish } from "@/lib/admin/emptyDish";
import { RecipeForm } from "./RecipeForm";

type Editing = { mode: "create" | "edit"; dish: DishEntry } | null;

export function RecipeList(): React.JSX.Element {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [newCountrySlug, setNewCountrySlug] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [dishes, setDishes] = useState<DishEntry[]>([]);
  const [sha, setSha] = useState<string | null>(null);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);

  useEffect(() => {
    listCountries()
      .then((res) => setCountries(res.countries))
      .catch(() => setError("Could not load the country list."));
  }, []);

  const loadDishes = (slug: string): void => {
    setLoadingDishes(true);
    setError(null);
    getCountryDishes(slug)
      .then((res) => {
        setDishes(res.dishes);
        setSha(res.sha);
        setSelectedSlug(slug);
      })
      .catch(() => setError(`Could not load dishes for "${slug}".`))
      .finally(() => setLoadingDishes(false));
  };

  const refetch = (): void => {
    if (selectedSlug) loadDishes(selectedSlug);
    setEditing(null);
  };

  const handleAdd = (): void => {
    const country = countries.find((c) => c.slug === selectedSlug);
    setEditing({
      mode: "create",
      dish: {
        ...emptyDish(),
        countrySlug: selectedSlug ?? "",
        country: country?.name ?? "",
        continentSlug: country?.continentSlug ?? "asia",
        continent: CONTINENTS.find((c) => c.slug === (country?.continentSlug ?? "asia"))?.name ?? "Asia",
      },
    });
  };

  const handleEdit = (dish: DishEntry): void => setEditing({ mode: "edit", dish: { ...dish } });

  const handleTurnOffFullRecipe = async (dish: DishEntry): Promise<void> => {
    if (!selectedSlug) return;
    setError(null);
    try {
      await updateDish(selectedSlug, dish.slug, { ...dish, fullRecipeAvailable: false }, sha);
      refetch();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not update dish.");
    }
  };

  const handleDelete = async (dish: DishEntry): Promise<void> => {
    if (!selectedSlug) return;
    if (!window.confirm(`Delete "${dish.name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteDish(selectedSlug, dish.slug, sha);
      refetch();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not delete dish.");
    }
  };

  if (editing) {
    return (
      <RecipeForm
        key={editing.mode === "edit" ? editing.dish.slug : "new"}
        mode={editing.mode}
        initialDish={editing.dish}
        countrySlug={editing.dish.countrySlug}
        expectedSha={sha}
        onSaved={refetch}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-meta text-xs uppercase tracking-wide text-ink/60">Country</span>
          <select
            value={selectedSlug ?? ""}
            onChange={(e) => e.target.value && loadDishes(e.target.value)}
            className="border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric"
          >
            <option value="">Select a country…</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.dishCount})
              </option>
            ))}
          </select>
        </label>

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const slug = newCountrySlug.trim().toLowerCase();
            if (slug) loadDishes(slug);
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="font-meta text-xs uppercase tracking-wide text-ink/60">Or a new country slug</span>
            <input
              type="text"
              value={newCountrySlug}
              onChange={(e) => setNewCountrySlug(e.target.value)}
              placeholder="e.g. vietnam"
              className="border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric"
            />
          </label>
          <button
            type="submit"
            className="border border-clay-line px-3 py-2 font-body text-sm text-ink/70 hover:border-ink focus-visible:outline-2 focus-visible:outline-turmeric"
          >
            Load
          </button>
        </form>
      </div>

      {error && <p className="font-body text-sm text-paprika">{error}</p>}

      {selectedSlug && !loadingDishes && (
        <>
          <button
            type="button"
            onClick={handleAdd}
            className="self-start bg-turmeric px-4 py-2 font-body text-sm font-medium text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            + Add dish to {selectedSlug}
          </button>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body text-sm">
              <thead>
                <tr className="border-b border-clay-line text-left text-ink/60">
                  <th className="py-2 pr-4 font-meta text-xs uppercase tracking-wide">Name</th>
                  <th className="py-2 pr-4 font-meta text-xs uppercase tracking-wide">Slug</th>
                  <th className="py-2 pr-4 font-meta text-xs uppercase tracking-wide">Difficulty</th>
                  <th className="py-2 pr-4 font-meta text-xs uppercase tracking-wide">Full recipe</th>
                  <th className="py-2 font-meta text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dishes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-ink/50">
                      No dishes yet for this country.
                    </td>
                  </tr>
                )}
                {dishes.map((dish) => (
                  <tr key={dish.slug} className="border-b border-clay-line/50">
                    <td className="py-2 pr-4">{dish.name}</td>
                    <td className="py-2 pr-4 font-meta text-xs text-ink/60">{dish.slug}</td>
                    <td className="py-2 pr-4">{dish.difficulty}</td>
                    <td className="py-2 pr-4">
                      {dish.fullRecipeAvailable ? (
                        <button
                          type="button"
                          onClick={() => handleTurnOffFullRecipe(dish)}
                          className="font-meta text-xs text-cardamom hover:underline"
                          title="Mark as discovery-only"
                        >
                          Yes — click to unset
                        </button>
                      ) : (
                        <span className="font-meta text-xs text-ink/40">No</span>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(dish)}
                          className="font-meta text-xs text-ink/70 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dish)}
                          className="font-meta text-xs text-paprika hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {loadingDishes && <p className="font-meta text-sm text-ink/50">Loading…</p>}
    </div>
  );
}
