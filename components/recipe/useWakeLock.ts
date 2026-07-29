"use client";

import { useEffect, useRef } from "react";

/** Keeps the screen awake while `active` is true. Feature-detected — silently
 * no-ops where the Wake Lock API is unavailable, and re-acquires the lock after
 * the tab returns from background (the OS releases it automatically on hide). */
export function useWakeLock(active: boolean): void {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    async function acquire(): Promise<void> {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await lock.release();
          return;
        }
        lockRef.current = lock;
      } catch {
        // Denied, backgrounded, or unsupported in this context — Cook Mode still works without it.
      }
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible" && lockRef.current === null) {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void lockRef.current?.release();
      lockRef.current = null;
    };
  }, [active]);
}
