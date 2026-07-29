"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FullRecipe } from "@/lib/types/recipe";

const COOK_PARAM = "cook";

interface RecipeWorkspaceValue {
  dish: FullRecipe;
  servings: number;
  setServings: (servings: number) => void;
  isCookMode: boolean;
  openCookMode: () => void;
  closeCookMode: () => void;
}

const RecipeWorkspaceContext = createContext<RecipeWorkspaceValue | null>(null);

interface RecipeWorkspaceProps {
  dish: FullRecipe;
  children: React.ReactNode;
}

/**
 * Shares servings + Cook Mode open/closed state between ServingsIngredients and
 * CookMode so a change in one is reflected in the other. Cook Mode's open state
 * lives in the ?cook=1 query param (not local state) so the browser back button
 * closes it for free, matching this site's URL-as-state filter convention.
 */
export function RecipeWorkspace({ dish, children }: RecipeWorkspaceProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [servings, setServings] = useState(dish.baseServings);

  const isCookMode = searchParams.get(COOK_PARAM) === "1";

  const openCookMode = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(COOK_PARAM, "1");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const closeCookMode = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(COOK_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const value = useMemo(
    () => ({ dish, servings, setServings, isCookMode, openCookMode, closeCookMode }),
    [dish, servings, isCookMode, openCookMode, closeCookMode],
  );

  return (
    <RecipeWorkspaceContext.Provider value={value}>{children}</RecipeWorkspaceContext.Provider>
  );
}

export function useRecipeWorkspace(): RecipeWorkspaceValue {
  const context = useContext(RecipeWorkspaceContext);
  if (!context) {
    throw new Error("useRecipeWorkspace must be used within a RecipeWorkspace provider");
  }
  return context;
}
