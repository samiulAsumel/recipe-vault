import Link from 'next/link';
import type { CountrySummary } from '@/lib/recipe-aggregations';

interface CountryCardProps {
  country: CountrySummary;
}

/** Section 5 Continent Hub: "name + dish count + flag-color sliver". Section 2 explicitly
 * defers per-country micro-accents to a later phase, so the sliver inherits the continent's
 * accent-1 for now. */
export function CountryCard({ country }: CountryCardProps): React.ReactElement {
  return (
    <Link
      href={`/${country.continentSlug}/${country.countrySlug}`}
      className="group flex items-center gap-3 border border-clay-line bg-parchment p-4 transition-colors hover:border-[var(--accent-1)] focus-visible:border-[var(--accent-1)]"
    >
      <span className="h-8 w-1.5 shrink-0 bg-[var(--accent-1)]" aria-hidden="true" />
      <span className="flex flex-1 items-baseline justify-between gap-2">
        <span className="font-display text-lg text-ink">{country.country}</span>
        <span className="font-mono text-xs text-ink/60">
          {country.dishCount} {country.dishCount === 1 ? 'dish' : 'dishes'}
        </span>
      </span>
    </Link>
  );
}
