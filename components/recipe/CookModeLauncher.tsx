"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRecipeWorkspace } from "@/components/recipe/RecipeWorkspace";
import { getDictionary, getLocaleFromPathname } from "@/lib/i18n";

/** Opens Cook Mode. Restores focus to itself when Cook Mode closes, per the
 * standard dialog-trigger accessibility pattern. */
export function CookModeLauncher(): React.JSX.Element {
  const { isCookMode, openCookMode } = useRecipeWorkspace();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(isCookMode);
  const dict = getDictionary(getLocaleFromPathname(usePathname()));

  useEffect(() => {
    if (wasOpenRef.current && !isCookMode) {
      buttonRef.current?.focus();
    }
    wasOpenRef.current = isCookMode;
  }, [isCookMode]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={openCookMode}
      className="border border-clay-line px-4 py-2 font-meta text-xs uppercase tracking-wide text-ink hover:border-ink"
    >
      {dict.cookMode.startCooking}
    </button>
  );
}
