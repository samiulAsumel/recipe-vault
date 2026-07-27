import Link from 'next/link';
import { AtlasPin } from '@/components/AtlasPin';
import type { Recipe } from '@/types/recipe';

interface DishCardProps {
  recipe: Recipe;
}

/** Section 2: flat card, no drop-shadow/rounded defaults, 1px clay-line border, Atlas Pin
 * badge in the corner. Self-scopes `data-region` to the recipe's own continent - Country/
 * Continent/Dish pages already set this on an ancestor (redundant there, harmless), but
 * cross-country pages (Meal-Time/Occasion hubs, Search) mix continents in one grid and have
 * no single ancestor region to inherit from. */
export function DishCard({ recipe }: DishCardProps): React.ReactElement {
  return (
    <Link
      href={`/${recipe.continentSlug}/${recipe.countrySlug}/${recipe.slug}`}
      data-region={recipe.continentSlug}
      className="group flex h-full flex-col gap-3 border border-clay-line bg-parchment p-4 transition-colors hover:border-[var(--accent-1)] focus-visible:border-[var(--accent-1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl leading-tight text-ink">{recipe.name}</h3>
        <AtlasPin confidenceLevel={recipe.confidenceLevel} occasion={recipe.occasion[0]} size="sm" />
      </div>
      <p className="text-sm text-ink/70">{recipe.shortDescription}</p>
      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink/60">
        <div>
          <dt className="sr-only">Total time</dt>
          <dd>{recipe.totalTimeMinutes} min</dd>
        </div>
        <div>
          <dt className="sr-only">Difficulty</dt>
          <dd>{recipe.difficulty}</dd>
        </div>
        {!recipe.fullRecipeAvailable && (
          <div>
            <dd className="text-paprika">Discovery only</dd>
          </div>
        )}
      </dl>
    </Link>
  );
}
