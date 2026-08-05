"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getDictionary, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";

export function SearchBar(): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const locale = getLocaleFromPathname(usePathname());
  const dict = getDictionary(locale);
  const searchPath = withLocalePrefix("/search/", locale);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        router.push(trimmed ? `${searchPath}?q=${encodeURIComponent(trimmed)}` : searchPath);
      }}
      className="flex w-full max-w-xl items-center border border-clay-line bg-parchment focus-within:border-ink"
    >
      <label htmlFor="site-search" className="sr-only">
        {dict.search.srLabel}
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={dict.search.placeholder}
        className="w-full bg-transparent px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
      />
      <Button
        type="submit"
        variant="primary"
        className="rounded-none border-l border-clay-line px-5 py-3"
      >
        {dict.search.submit}
      </Button>
    </form>
  );
}
