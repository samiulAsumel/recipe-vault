import { AtlasRule } from '@/components/AtlasRule';
import { DishCard } from '@/components/DishCard';
import { FilterBar } from '@/components/FilterBar';
import type { Recipe } from '@/types/recipe';

interface RecipeGridSectionProps {
  breadcrumbLabel: string;
  heading: string;
  statusMessage: string | null;
  recipes: Recipe[];
  filterBarAction: string;
  selectedMealTimes: string[];
  selectedDiets: string[];
  availableOccasions: string[];
  selectedOccasions: string[];
}

/** Section 9 Phase 5 / Section 6: "same filter bar component reused on Country page, Meal-Time
 * hub, Occasion hub, and Search page - build it once as a shared component." This is that
 * shared block: breadcrumb + atlas-plate heading + scale-bar rule + FilterBar + dish grid +
 * empty/unavailable state. Country page wraps it with its own continent accent + drinks strip;
 * cross-country hub pages wrap it plainly since dishes span every continent. */
export function RecipeGridSection({
  breadcrumbLabel,
  heading,
  statusMessage,
  recipes,
  filterBarAction,
  selectedMealTimes,
  selectedDiets,
  availableOccasions,
  selectedOccasions,
}: RecipeGridSectionProps): React.ReactElement {
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-1)]">
        {breadcrumbLabel}
      </p>
      <h1 className="mt-2 font-display text-5xl">{heading}</h1>
      <div className="mt-6">
        <AtlasRule />
      </div>

      {statusMessage ? (
        <p className="mt-10 text-ink/60">{statusMessage}</p>
      ) : (
        <>
          <div className="mt-8">
            <FilterBar
              action={filterBarAction}
              selectedMealTimes={selectedMealTimes}
              selectedDiets={selectedDiets}
              availableOccasions={availableOccasions}
              selectedOccasions={selectedOccasions}
            />
          </div>

          <div className="mt-8">
            {recipes.length === 0 ? (
              <p className="text-ink/60">No dishes match these filters yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <DishCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
