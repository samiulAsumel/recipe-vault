import { bn } from "@/lib/i18n/dictionaries/bn";
import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";

export type Locale = "en" | "bn";

export const LOCALES: Locale[] = ["en", "bn"];

const DICTIONARIES: Record<Locale, Dictionary> = { en, bn };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Every Bengali route lives under a literal /bn/ prefix (see app/bn/...);
 * everything else is English. Used by "use client" components that already
 * call usePathname() for filter/cook-mode state, so they can resolve locale
 * without a new context provider. */
export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/bn" || pathname.startsWith("/bn/") ? "bn" : "en";
}

/** Strips a leading /bn prefix so a pathname can be re-prefixed for the other
 * locale (used by the language switcher and by components that need the
 * locale-neutral path, e.g. to build the counterpart-language link). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/bn") return "/";
  if (pathname.startsWith("/bn/")) return pathname.slice(3) || "/";
  return pathname;
}

export function withLocalePrefix(pathname: string, locale: Locale): string {
  const bare = stripLocalePrefix(pathname);
  if (locale === "en") return bare;
  return bare === "/" ? "/bn/" : `/bn${bare}`;
}
