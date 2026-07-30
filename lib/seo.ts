import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/i18n";

interface PageSeoOptions {
  title: string;
  description: string;
  /** Site-relative path with a leading and trailing slash, e.g. "/breakfast/"
   * or "/bn/breakfast/" — the locale is inferred from this prefix. */
  path: string;
  /** Home only: bypasses the root layout's "%s | World Kitchen Atlas" template,
   * which would otherwise double up on a title that's already the site name. */
  isHome?: boolean;
}

const OG_LOCALE = { en: "en_US", bn: "bn_BD" } as const;

/**
 * Title + description + canonical + baseline Open Graph, shared by every page
 * that doesn't have bespoke metadata needs (the dish page's own generateMetadata
 * has real per-dish specifics — hero image, type: 'article' — and builds its own).
 * Canonical/OG are omitted, not relatively-faked, when no production domain is
 * configured yet — a canonical tag must be absolute to be valid.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  isHome = false,
}: PageSeoOptions): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = siteUrl ? `${siteUrl}${path}` : undefined;
  const locale = path.startsWith("/bn/") || path === "/bn" ? "bn" : "en";
  const otherLocale = locale === "en" ? "bn" : "en";
  const otherPath = withLocalePrefix(stripLocalePrefix(path), otherLocale);
  const languages = siteUrl
    ? { [locale]: `${siteUrl}${path}`, [otherLocale]: `${siteUrl}${otherPath}` }
    : undefined;

  return {
    title: isHome ? { absolute: title } : title,
    description,
    ...(canonical ? { alternates: { canonical, ...(languages ? { languages } : {}) } } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      locale: OG_LOCALE[locale],
      ...(canonical ? { url: canonical } : {}),
    },
  };
}
