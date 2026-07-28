"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar(): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        router.push(trimmed ? `/search/?q=${encodeURIComponent(trimmed)}` : "/search/");
      }}
      className="flex w-full max-w-xl items-center border border-clay-line bg-parchment focus-within:border-ink"
    >
      <label htmlFor="site-search" className="sr-only">
        Search dishes, countries, or ingredients
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search dishes, countries, or ingredients…"
        className="w-full bg-transparent px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
      />
      <button
        type="submit"
        className="border-l border-clay-line px-4 py-3 font-meta text-xs uppercase tracking-wide text-ink/70 hover:text-turmeric"
      >
        Search
      </button>
    </form>
  );
}
