'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AtlasPin } from '@/components/AtlasPin';
import { IngredientList } from '@/components/recipe-detail/IngredientList';
import { MiseEnPlace } from '@/components/recipe-detail/MiseEnPlace';
import { NutritionTable } from '@/components/recipe-detail/NutritionTable';
import { ServingsStepper } from '@/components/recipe-detail/ServingsStepper';
import { StepCard } from '@/components/recipe-detail/StepCard';
import { SubstitutionsTable } from '@/components/recipe-detail/SubstitutionsTable';
import { formatDurationMinutes } from '@/lib/ingredient-scaling';
import type { FullRecipe, IngredientItem } from '@/types/recipe';

interface FullRecipeViewProps {
  recipe: FullRecipe;
}

function buildIngredientsById(recipe: FullRecipe): Map<string, IngredientItem> {
  const map = new Map<string, IngredientItem>();
  for (const group of recipe.ingredientGroups) {
    for (const item of group.items) {
      map.set(item.id, item);
    }
  }
  return map;
}

/** Section 2 two-column layout: sticky ingredients sidebar, steps flowing right. Section 4:
 * servings is the one piece of state that everything else (ingredient amounts, inline step
 * references, nutrition) derives from during render. */
export function FullRecipeView({ recipe }: FullRecipeViewProps): React.ReactElement {
  const [servings, setServings] = useState(recipe.baseServings);
  const ingredientsById = buildIngredientsById(recipe);

  return (
    <main data-region={recipe.continentSlug} className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <article className="mx-auto max-w-6xl">
        <header>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-1)]">
            <Link href={`/${recipe.continentSlug}/${recipe.countrySlug}`} className="hover:underline">
              {recipe.country}
            </Link>
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-display text-5xl">{recipe.name}</h1>
            <AtlasPin confidenceLevel={recipe.confidenceLevel} occasion={recipe.occasion[0]} size="lg" />
          </div>
          <p className="mt-4 max-w-3xl text-ink/70">{recipe.headnote}</p>

          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-clay-line py-4 font-mono text-xs text-ink/70">
            <div>
              <dt className="uppercase tracking-widest text-ink/50">Total time</dt>
              <dd className="mt-0.5 text-sm text-ink">
                {formatDurationMinutes(recipe.timing.totalMinutes)}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-widest text-ink/50">Prep</dt>
              <dd className="mt-0.5 text-sm text-ink">{formatDurationMinutes(recipe.timing.prepMinutes)}</dd>
            </div>
            {recipe.timing.marinateMinutes > 0 && (
              <div>
                <dt className="uppercase tracking-widest text-ink/50">Marinate</dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {formatDurationMinutes(recipe.timing.marinateMinutes)}
                </dd>
              </div>
            )}
            <div>
              <dt className="uppercase tracking-widest text-ink/50">Active cook</dt>
              <dd className="mt-0.5 text-sm text-ink">
                {formatDurationMinutes(recipe.timing.activeCookMinutes)}
              </dd>
            </div>
            {recipe.timing.restMinutes > 0 && (
              <div>
                <dt className="uppercase tracking-widest text-ink/50">Rest</dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {formatDurationMinutes(recipe.timing.restMinutes)}
                </dd>
              </div>
            )}
            <div>
              <dt className="uppercase tracking-widest text-ink/50">Difficulty</dt>
              <dd className="mt-0.5 text-sm text-ink">{recipe.difficulty}</dd>
            </div>
          </dl>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <ServingsStepper servings={servings} onChange={setServings} />
            <MiseEnPlace items={recipe.miseEnPlace} equipment={recipe.equipment} />
            <IngredientList
              groups={recipe.ingredientGroups}
              baseServings={recipe.baseServings}
              servings={servings}
            />
          </aside>

          <ol className="flex flex-col gap-4">
            {recipe.steps.map((step) => (
              <StepCard
                key={step.stepNumber}
                step={step}
                ingredientsById={ingredientsById}
                baseServings={recipe.baseServings}
                servings={servings}
              />
            ))}
          </ol>
        </div>

        <footer className="mt-16 flex flex-col gap-10 border-t border-clay-line pt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">Doneness</h2>
              <p className="mt-2 text-sm text-ink/80">{recipe.donenessSummary}</p>
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">Plating</h2>
              <p className="mt-2 text-sm text-ink/80">{recipe.platingNote}</p>
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">Storage</h2>
              <p className="mt-2 text-sm text-ink/80">{recipe.storageNote}</p>
            </div>
            {recipe.pairedDrink.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">Paired drink</h2>
                <p className="mt-2 text-sm text-ink/80">{recipe.pairedDrink.join(', ')}</p>
              </div>
            )}
          </div>

          {recipe.chefTips.length > 0 && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">Chef&apos;s tips</h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/80">
                {recipe.chefTips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span aria-hidden="true">-</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SubstitutionsTable substitutions={recipe.substitutions} />

          {recipe.regionalVariations.length > 0 && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink/60">
                Regional variations
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/80">
                {recipe.regionalVariations.map((variation) => (
                  <li key={variation}>{variation}</li>
                ))}
              </ul>
            </div>
          )}

          <NutritionTable
            estimate={recipe.nutritionEstimate}
            baseServings={recipe.baseServings}
            servings={servings}
          />
        </footer>
      </article>
    </main>
  );
}
