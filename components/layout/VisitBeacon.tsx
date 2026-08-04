"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getPublicDataApiUrl } from "@/lib/env";
import { isContinentSlug } from "@/lib/constants";

type PageKind = "home" | "continent" | "country" | "dish" | "other";

interface Tracked {
  page: PageKind;
  id?: string;
}

function classify(pathname: string): Tracked | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "bn") segments.shift();

  if (segments[0] === "admin") return null;
  if (segments.length === 0) return { page: "home" };
  if (!isContinentSlug(segments[0])) return { page: "other" };
  if (segments.length === 1) return { page: "continent" };
  if (segments.length === 2) return { page: "country", id: segments[1] };
  if (segments.length === 3) return { page: "dish", id: segments[2] };
  return { page: "other" };
}

/** Fires the Section 10 visit-counter beacon on every route change, including
 * client-side navigations. Modelled on ContentProtection.tsx: an invisible,
 * always-mounted client effect that returns null. Never tracks /admin — own
 * admin sessions must not inflate visitor counts. */
export function VisitBeacon(): null {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const tracked = classify(pathname);
    if (!tracked) return;

    try {
      const url = new URL("/api/track", getPublicDataApiUrl());
      url.searchParams.set("page", tracked.page);
      if (tracked.id) url.searchParams.set("id", tracked.id);
      fetch(url, { keepalive: true, cache: "no-store" }).catch(() => {
        // Analytics must never break a page render.
      });
    } catch {
      // Missing DATA_API_URL config, etc. — same rule, never surface this.
    }
  }, [pathname]);

  return null;
}
