'use client';

interface SearchQueryInputProps {
  query: string;
  onQueryChange: (query: string) => void;
}

/** Lives inside FilterBar's own <form name="q">, so submitting the checkboxes ("Apply
 * filters") carries the current search text along with them - while onChange still drives
 * SearchExperience's live, no-reload Fuse.js results on every keystroke. */
export function SearchQueryInput({ query, onQueryChange }: SearchQueryInputProps): React.ReactElement {
  return (
    <div className="w-full">
      <label htmlFor="search-q" className="sr-only">
        Search dishes
      </label>
      <input
        id="search-q"
        type="search"
        name="q"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search a dish, country, or ingredient"
        className="w-full border border-clay-line bg-parchment px-4 py-2 text-ink placeholder:text-ink/40 focus-visible:border-turmeric"
      />
    </div>
  );
}
