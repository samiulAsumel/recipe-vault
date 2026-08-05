"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRecipeWorkspace } from "@/components/recipe/RecipeWorkspace";
import { Button } from "@/components/ui/Button";
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
    <Button ref={buttonRef} variant="primary" onClick={openCookMode}>
      {dict.cookMode.startCooking}
    </Button>
  );
}
