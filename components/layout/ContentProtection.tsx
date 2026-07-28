"use client";

import { useEffect } from "react";

const BLOCKED_DEVTOOLS_KEYS = new Set(["I", "J", "C"]);

/**
 * Section 14's cosmetic deterrent layer — blocks casual right-click/copy and the
 * common DevTools shortcuts. This is explicitly NOT real security (the browser
 * must ship the full HTML/CSS/JS to render the page at all); it only stops a
 * casual visitor, not a scraping bot. Real protection is Cloudflare-side
 * (Bot Fight Mode, rate limiting — see README) plus the robots.txt AI-crawler
 * rules and the footer copyright notice.
 */
export function ContentProtection(): null {
  useEffect(() => {
    const blockContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
    };

    const blockDevToolsShortcuts = (event: KeyboardEvent): void => {
      const isDevToolsCombo =
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && BLOCKED_DEVTOOLS_KEYS.has(event.key.toUpperCase())) ||
        (event.ctrlKey && event.key.toUpperCase() === "U");
      if (isDevToolsCombo) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockDevToolsShortcuts);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockDevToolsShortcuts);
    };
  }, []);

  return null;
}
