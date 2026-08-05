"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { buildSubstitutionIndex, type SubstitutionGroup } from "@/lib/data/substitutions";
import { getDictionary, getLocaleFromPathname, type Locale } from "@/lib/i18n";
import type { DishEntry } from "@/lib/types/recipe";

interface SubstitutionResultsProps {
  dishes: DishEntry[];
}

function dishHref(dish: DishEntry, locale: Locale): string {
  const path = `/${dish.continentSlug}/${dish.countrySlug}/${dish.slug}/`;
  return locale === "bn" ? `/bn${path}` : path;
}

function dishName(dish: DishEntry, locale: Locale): string {
  return locale === "bn" ? (dish.translations?.bn?.name ?? dish.name) : dish.name;
}

export function SubstitutionResults({ dishes }: SubstitutionResultsProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
  const dict = getDictionary(locale);
  const query = searchParams.get("q")?.trim() ?? "";

  // Same "adjust state during render" input-reset pattern as SearchResults —
  // keeps the box in sync with `q` from back/forward or a fresh link, without
  // fighting local typing via an effect.
  const [previousQuery, setPreviousQuery] = useState(query);
  const [queryInput, setQueryInput] = useState(query);
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setQueryInput(query);
  }

  const groups = useMemo(() => buildSubstitutionIndex(dishes, locale), [dishes, locale]);

  const alphabeticalGroups = useMemo(
    () =>
      [...groups].sort((a, b) =>
        a.original.localeCompare(b.original, locale === "bn" ? "bn-BD" : "en-US"),
      ),
    [groups, locale],
  );

  const fuse = useMemo(
    () =>
      new Fuse(groups, {
        keys: [
          { name: "original", weight: 2 },
          { name: "entries.swap", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [groups],
  );

  // No query: the full A-Z index doubles as a browsable ingredient
  // reference. With a query, Fuse's relevance ranking is the point.
  const results = query ? fuse.search(query).map((result) => result.item) : alphabeticalGroups;

  function submitQuery(next: string): void {
    const trimmed = next.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuery(queryInput);
        }}
        className="flex w-full max-w-xl items-center overflow-hidden rounded-[5px] border border-clay-line bg-surface focus-within:border-turmeric"
      >
        <label htmlFor="substitution-results-query" className="sr-only">
          {dict.substitutions.srLabel}
        </label>
        <input
          id="substitution-results-query"
          type="search"
          value={queryInput}
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder={dict.substitutions.placeholder}
          className="w-full bg-transparent px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <Button type="submit" variant="primary" className="rounded-none border-l border-clay-line px-5 py-3">
          {dict.substitutions.submit}
        </Button>
      </form>

      {results.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-clay-line p-8 text-center font-body text-sm text-ink/60">
          {dict.substitutions.noResultsForQuery(query)}
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {results.map((group) => (
            <SubstitutionGroupCard key={group.key} group={group} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubstitutionGroupCard({
  group,
  locale,
}: {
  group: SubstitutionGroup;
  locale: Locale;
}): React.JSX.Element {
  const dict = getDictionary(locale);

  return (
    <article className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-2 border-b border-clay-line pb-2">
        <span className="font-display text-lg text-ink">{group.original}</span>
        <span className="font-meta text-xs uppercase tracking-wide text-ink/50">
          {dict.substitutions.swapCount(group.entries.length)}
        </span>
      </h2>
      <ul className="flex flex-col gap-4">
        {group.entries.map((entry, index) => (
          <li key={`${entry.dish.id}-${index}`} className="flex flex-col gap-1">
            <p className="font-body text-sm text-ink">
              <span aria-hidden>→ </span>
              <span className="font-medium">{entry.swap}</span>
            </p>
            {entry.impact && <p className="font-body text-sm text-ink/70">{entry.impact}</p>}
            <p className="font-meta text-xs text-ink/50">
              {dict.substitutions.documentedIn}{" "}
              <Link href={dishHref(entry.dish, locale)} className="text-turmeric hover:underline">
                {dishName(entry.dish, locale)}
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}
