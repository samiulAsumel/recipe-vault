"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";
import { getDictionary, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";
import { localizeContinentName, MEAL_TIME_LABELS, localizeOccasionName } from "@/lib/i18n/labels";

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictionary(locale);
  const otherLocale = locale === "en" ? "bn" : "en";
  const prefix = (path: string): string => withLocalePrefix(path, locale);

  return (
    <header lang={locale === "bn" ? "bn" : undefined} className="border-b border-clay-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href={prefix("/")} className="font-display text-xl tracking-tight text-ink">
          {dict.site.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-ink/80">
          {CONTINENTS.map((continent) => (
            <Link key={continent.slug} href={prefix(`/${continent.slug}`)} className="hover:text-turmeric">
              {localizeContinentName(continent.name, locale)}
            </Link>
          ))}
          {MEAL_TIMES.map((mealTime) => (
            <Link key={mealTime.slug} href={prefix(`/${mealTime.slug}`)} className="hover:text-turmeric">
              {MEAL_TIME_LABELS[locale][mealTime.name]}
            </Link>
          ))}
          {OCCASIONS.map((occasion) => (
            <Link key={occasion.slug} href={prefix(`/${occasion.slug}`)} className="hover:text-turmeric">
              {localizeOccasionName(occasion.name, locale)}
            </Link>
          ))}
          <Link href={prefix("/search")} className="hover:text-turmeric">
            {dict.nav.search}
          </Link>
          <Link href={prefix("/about")} className="hover:text-turmeric">
            {dict.nav.about}
          </Link>
          <Link
            href={withLocalePrefix(pathname, otherLocale)}
            className="border border-clay-line px-2 py-0.5 font-meta text-xs uppercase tracking-wide hover:border-ink"
            hrefLang={otherLocale}
          >
            {otherLocale === "bn" ? "বাংলা" : "English"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
