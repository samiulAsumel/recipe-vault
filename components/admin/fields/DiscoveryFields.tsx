import type { DishEntry, Difficulty, ConfidenceLevel, Category } from "@/lib/types/recipe";
import type { ValidationIssue } from "@/lib/admin/client";
import { fieldError } from "@/lib/admin/fieldError";
import { CONTINENTS, MEAL_TIMES, DIETARY_FLAGS } from "@/lib/constants";
import { TextField, TextArea, NumberField, SelectField, CheckboxRow, ChipToggleGroup } from "../ui/FormControls";
import { RepeatableList } from "../ui/RepeatableList";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["high", "medium", "low"];
const CATEGORIES: Category[] = ["Mains", "Sides", "Snacks", "Desserts", "Drinks", "Breads", "Soups"];

interface DiscoveryFieldsProps {
  dish: DishEntry;
  onChange: (dish: DishEntry) => void;
  errors: ValidationIssue[];
  /** True when editing an existing dish — country/continent identify which file it lives in. */
  countryLocked: boolean;
}

export function DiscoveryFields({ dish, onChange, errors, countryLocked }: DiscoveryFieldsProps): React.JSX.Element {
  const set = <K extends keyof DishEntry>(key: K, value: DishEntry[K]): void => {
    onChange({ ...dish, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Dish name" value={dish.name} onChange={(v) => set("name", v)} error={fieldError(errors, "name")} />
        <TextField label="Slug" value={dish.slug} onChange={(v) => set("slug", v)} error={fieldError(errors, "slug")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Country"
          value={dish.country}
          onChange={(v) => set("country", v)}
          error={fieldError(errors, "country")}
          placeholder={countryLocked ? undefined : "e.g. Bangladesh"}
        />
        <TextField
          label="Country slug"
          value={dish.countrySlug}
          onChange={(v) => set("countrySlug", v)}
          error={fieldError(errors, "countrySlug")}
          placeholder={countryLocked ? undefined : "e.g. bangladesh"}
        />
      </div>
      {countryLocked && (
        <p className="-mt-4 font-body text-xs text-ink/50">
          Country is locked while editing — create a new dish to add one under a different country.
        </p>
      )}

      <SelectField
        label="Continent"
        value={dish.continentSlug}
        onChange={(v) => {
          const continent = CONTINENTS.find((c) => c.slug === v);
          onChange({ ...dish, continentSlug: v as DishEntry["continentSlug"], continent: continent?.name ?? dish.continent });
        }}
        options={CONTINENTS.map((c) => ({ value: c.slug, label: c.name }))}
        error={fieldError(errors, "continentSlug")}
      />

      <ChipToggleGroup
        legend="Meal time"
        options={MEAL_TIMES.map((m) => ({ value: m.name, label: m.name }))}
        active={dish.mealTime}
        onChange={(values) => set("mealTime", values as DishEntry["mealTime"])}
        error={fieldError(errors, "mealTime")}
      />

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Occasion</span>
        <RepeatableList
          items={dish.occasion}
          onChange={(values) => set("occasion", values)}
          makeNew={() => ""}
          addLabel="Add occasion"
          emptyLabel="No occasions tagged yet."
          renderItem={(value, update) => (
            <input
              type="text"
              value={value}
              onChange={(e) => update(e.target.value)}
              placeholder="e.g. Wedding"
              className="w-full border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric"
            />
          )}
        />
      </div>

      <CheckboxRow label="Street food" checked={dish.streetFood} onChange={(v) => set("streetFood", v)} />

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Dietary</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIETARY_FLAGS.map((flag) => (
            <CheckboxRow
              key={flag.key}
              label={flag.label}
              checked={dish.dietary[flag.key]}
              onChange={(v) => set("dietary", { ...dish.dietary, [flag.key]: v })}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Difficulty"
          value={dish.difficulty}
          onChange={(v) => set("difficulty", v as Difficulty)}
          options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
          error={fieldError(errors, "difficulty")}
        />
        <SelectField
          label="Confidence level"
          value={dish.confidenceLevel}
          onChange={(v) => set("confidenceLevel", v as ConfidenceLevel)}
          options={CONFIDENCE_LEVELS.map((c) => ({ value: c, label: c }))}
          error={fieldError(errors, "confidenceLevel")}
        />
        <SelectField
          label="Category"
          value={dish.category}
          onChange={(v) => set("category", v as Category)}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={fieldError(errors, "category")}
        />
      </div>

      <NumberField
        label="Total time (minutes)"
        value={dish.totalTimeMinutes}
        onChange={(v) => set("totalTimeMinutes", v)}
        error={fieldError(errors, "totalTimeMinutes")}
        min={1}
      />

      <TextArea
        label="Historic note"
        value={dish.historicNote}
        onChange={(v) => set("historicNote", v)}
        error={fieldError(errors, "historicNote")}
      />
      <TextArea
        label="When eaten"
        value={dish.whenEaten}
        onChange={(v) => set("whenEaten", v)}
        error={fieldError(errors, "whenEaten")}
      />

      <div>
        <span className="mb-2 block font-meta text-xs uppercase tracking-wide text-ink/60">Paired drink(s)</span>
        <RepeatableList
          items={dish.pairedDrink}
          onChange={(values) => set("pairedDrink", values)}
          makeNew={() => ""}
          addLabel="Add paired drink"
          emptyLabel="No paired drinks yet."
          renderItem={(value, update) => (
            <input
              type="text"
              value={value}
              onChange={(e) => update(e.target.value)}
              className="w-full border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric"
            />
          )}
        />
      </div>

      <TextArea
        label="Short description"
        value={dish.shortDescription}
        onChange={(v) => set("shortDescription", v)}
        error={fieldError(errors, "shortDescription")}
      />
      <TextField
        label="Hero image path"
        value={dish.heroImage}
        onChange={(v) => set("heroImage", v)}
        error={fieldError(errors, "heroImage")}
        placeholder="/images/country-slug/dish-slug.jpg"
      />

      <CheckboxRow
        label="Full recipe available"
        checked={dish.fullRecipeAvailable}
        onChange={(v) => set("fullRecipeAvailable", v)}
      />
    </div>
  );
}
