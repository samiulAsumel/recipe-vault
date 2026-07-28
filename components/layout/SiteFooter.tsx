"use client";

import { useRouter } from "next/navigation";

export function SiteFooter(): React.JSX.Element {
  const router = useRouter();

  // Ctrl+Shift+Click on the copyright line is the Section 11 hidden admin
  // entry point — discovery-only obscurity, not real security; /admin itself
  // still enforces full login regardless of how it's reached.
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>): void => {
    if (e.ctrlKey && e.shiftKey) {
      router.push("/admin/");
    }
  };

  return (
    <footer className="border-t border-clay-line">
      <div className="mx-auto max-w-6xl px-6 py-8 font-meta text-xs text-ink/60">
        <span onClick={handleClick}>
          © {new Date().getFullYear()} World Kitchen Atlas. All content is original; unauthorized reproduction is
          prohibited.
        </span>
      </div>
    </footer>
  );
}
