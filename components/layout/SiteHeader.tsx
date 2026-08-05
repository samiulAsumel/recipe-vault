"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronDownIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";
import { getDictionary, getLocaleFromPathname, withLocalePrefix } from "@/lib/i18n";
import { localizeContinentName, MEAL_TIME_LABELS, localizeOccasionName } from "@/lib/i18n/labels";

interface NavLink {
  href: string;
  label: string;
}

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictionary(locale);
  const otherLocale = locale === "en" ? "bn" : "en";
  const prefix = (path: string): string => withLocalePrefix(path, locale);

  const continentLinks: NavLink[] = CONTINENTS.map((continent) => ({
    href: prefix(`/${continent.slug}`),
    label: localizeContinentName(continent.name, locale),
  }));
  const browseLinks: NavLink[] = [
    ...MEAL_TIMES.map((mealTime) => ({
      href: prefix(`/${mealTime.slug}`),
      label: MEAL_TIME_LABELS[locale][mealTime.name],
    })),
    ...OCCASIONS.map((occasion) => ({
      href: prefix(`/${occasion.slug}`),
      label: localizeOccasionName(occasion.name, locale),
    })),
  ];
  const langToggleHref = withLocalePrefix(pathname, otherLocale);
  const langToggleLabel = otherLocale === "bn" ? "বাংলা" : "English";

  const [mobileOpen, setMobileOpen] = useState(false);
  // Close the drawer on route change (including browser back/forward, which
  // the drawer links' own onClick can't catch) — setState during render on a
  // changed prop is the React-recommended alternative to setState-in-effect.
  const [drawerPathname, setDrawerPathname] = useState(pathname);
  if (pathname !== drawerPathname) {
    setDrawerPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header lang={locale === "bn" ? "bn" : undefined} className="border-b border-clay-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href={prefix("/")} className="font-display text-xl tracking-tight text-ink">
          {dict.site.name}
        </Link>

        {/* Desktop nav — two grouped dropdowns instead of 13 flat links. */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavDropdown label={dict.nav.continents} links={continentLinks} />
          <NavDropdown label={dict.nav.browse} links={browseLinks} />
          <Link href={prefix("/search")} className={buttonClasses("ghost", "sm")}>
            <SearchIcon size={15} />
            {dict.nav.search}
          </Link>
          <Link href={prefix("/about")} className={buttonClasses("ghost", "sm")}>
            {dict.nav.about}
          </Link>
          <Link
            href={langToggleHref}
            hrefLang={otherLocale}
            aria-label={dict.nav.switchLanguage}
            className={buttonClasses("secondary", "sm")}
          >
            {langToggleLabel}
          </Link>
        </nav>

        {/* Mobile trigger — hamburger only; the drawer below carries every link. */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={dict.nav.openMenu}
          onClick={() => setMobileOpen(true)}
          className={`${buttonClasses("ghost", "sm")} md:hidden`}
        >
          <MenuIcon size={22} />
        </button>
      </div>

      {mobileOpen && (
        <MobileDrawer
          onClose={() => setMobileOpen(false)}
          closeLabel={dict.nav.closeMenu}
          sections={[
            { heading: dict.nav.continents, links: continentLinks },
            { heading: dict.nav.browse, links: browseLinks },
          ]}
          extraLinks={[
            { href: prefix("/search"), label: dict.nav.search },
            { href: prefix("/about"), label: dict.nav.about },
          ]}
          langToggle={{ href: langToggleHref, label: langToggleLabel, hrefLang: otherLocale }}
        />
      )}
    </header>
  );
}

function NavDropdown({ label, links }: { label: string; links: NavLink[] }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = links.some((link) => pathname === link.href || pathname === `${link.href}/`);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={buttonClasses(isActive ? "primary" : "ghost", "sm", "gap-1")}
      >
        {label}
        <ChevronDownIcon size={12} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 grid w-56 grid-cols-1 gap-0.5 rounded-[var(--radius-card)] border border-clay-line bg-surface p-2 shadow-[var(--shadow-lift)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[5px] px-2 py-1.5 font-body text-sm text-ink/80 hover:bg-clay-line/20 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface MobileDrawerProps {
  onClose: () => void;
  closeLabel: string;
  sections: Array<{ heading: string; links: NavLink[] }>;
  extraLinks: NavLink[];
  langToggle: { href: string; label: string; hrefLang: string };
}

function MobileDrawer({
  onClose,
  closeLabel,
  sections,
  extraLinks,
  langToggle,
}: MobileDrawerProps): React.JSX.Element {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col gap-6 overflow-y-auto border-l border-clay-line bg-surface p-6"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-ink">World Kitchen Atlas</span>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className={buttonClasses("ghost", "sm")}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-2">
            <h2 className="font-meta text-xs uppercase tracking-wide text-ink/50">
              {section.heading}
            </h2>
            <div className="flex flex-col">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="border-b border-clay-line py-2.5 font-body text-base text-ink/80 hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-col">
          {extraLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-clay-line py-2.5 font-body text-base text-ink/80 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href={langToggle.href}
          hrefLang={langToggle.hrefLang}
          onClick={onClose}
          className={`self-start ${buttonClasses("secondary", "md")}`}
        >
          {langToggle.label}
        </Link>
      </div>
    </div>
  );
}
