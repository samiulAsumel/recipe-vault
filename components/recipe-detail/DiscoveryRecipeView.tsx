import Link from 'next/link';
import { AtlasPin } from '@/components/AtlasPin';
import type { DiscoveryRecipe } from '@/types/recipe';

interface DiscoveryRecipeViewProps {
  recipe: DiscoveryRecipe;
}

/** Section 5 discovery-only variant: single column - origin, historic note, when-eaten,
 * paired drink, "Full recipe coming soon" state. */
export function DiscoveryRecipeView({ recipe }: DiscoveryRecipeViewProps): React.ReactElement {
  return (
    <main data-region={recipe.continentSlug} className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <article className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-1)]">
          <Link href={`/${recipe.continentSlug}/${recipe.countrySlug}`} className="hover:underline">
            {recipe.country}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-4xl">{recipe.name}</h1>
          <AtlasPin confidenceLevel={recipe.confidenceLevel} occasion={recipe.occasion[0]} />
        </div>
        <p className="mt-4 text-ink/70">{recipe.shortDescription}</p>

        <dl className="mt-8 flex flex-col gap-6">
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-ink/60">Historic note</dt>
            <dd className="mt-1 text-ink/80">{recipe.historicNote}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-ink/60">When eaten</dt>
            <dd className="mt-1 text-ink/80">{recipe.whenEaten}</dd>
          </div>
          {recipe.pairedDrink.length > 0 && (
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-ink/60">Paired drink</dt>
              <dd className="mt-1 text-ink/80">{recipe.pairedDrink.join(', ')}</dd>
            </div>
          )}
        </dl>

        <p className="mt-10 border border-clay-line px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-ink/60">
          Full recipe coming soon
        </p>
      </article>
    </main>
  );
}
