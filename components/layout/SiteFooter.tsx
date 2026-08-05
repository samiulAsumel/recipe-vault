"use client";

import { usePathname, useRouter } from "next/navigation";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";

export function SiteFooter(): React.JSX.Element {
  const router = useRouter();
  const locale = getLocaleFromPathname(usePathname());
  const dict = getDictionary(locale);

  // Ctrl+Shift+Click on the copyright line is the Section 11 hidden admin
  // entry point — discovery-only obscurity, not real security; /admin itself
  // still enforces full login regardless of how it's reached. Admin stays
  // unprefixed/English-only in both locales — internal tool, not duplicated.
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>): void => {
    if (e.ctrlKey && e.shiftKey) {
      router.push("/admin/");
    }
  };

  return (
    <footer lang={locale === "bn" ? "bn" : undefined} className="border-t border-clay-line bg-clay-line/5">
      <div className="mx-auto max-w-6xl px-6 py-10 font-meta text-xs text-ink/50">
        <span onClick={handleClick}>{dict.footer.copyright(new Date().getFullYear())}</span>
      </div>
    </footer>
  );
}
