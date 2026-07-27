'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isContinentSlug } from '@/lib/constants';

interface TrackingTarget {
  countrySlug?: string;
  dishSlug?: string;
}

function parseTrackingTarget(pathname: string): TrackingTarget {
  const [continent, country, dish] = pathname.split('/').filter(Boolean);
  if (continent && isContinentSlug(continent)) {
    return { countrySlug: country, dishSlug: dish };
  }
  return {};
}

/** Section 10: fires a tracking beacon on every route change, no cookies, no visitor identity.
 * A side effect synchronizing with an external system (the KV counters) - a legitimate
 * useEffect use, not derived render state. `keepalive` lets the request finish even if the
 * visitor navigates away immediately after. Mounted once in the root layout. */
export function PageViewTracker(): null {
  const pathname = usePathname();

  useEffect(() => {
    const { countrySlug, dishSlug } = parseTrackingTarget(pathname);
    const params = new URLSearchParams();

    if (dishSlug && countrySlug) {
      params.set('page', 'dish');
      params.set('country', countrySlug);
      params.set('id', dishSlug);
    } else if (countrySlug) {
      params.set('page', 'country');
      params.set('country', countrySlug);
    } else {
      params.set('page', 'other');
    }

    fetch(`/api/track?${params.toString()}`, { keepalive: true }).catch(() => {
      // Best-effort - a failed tracking beacon must never affect the visitor.
    });
  }, [pathname]);

  return null;
}
