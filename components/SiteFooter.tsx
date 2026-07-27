'use client';

/** Section 11: hidden admin entry - Ctrl+Shift+Click on the footer copyright text navigates
 * to /admin. This is discovery-only obscurity, not security; /admin's own login check (see
 * app/admin/page.tsx) is what actually protects it, regardless of how the route is reached.
 * The copyright wording doubles as Section 14's footer notice. */
export function SiteFooter(): React.ReactElement {
  return (
    <footer className="border-t border-clay-line px-6 py-6">
      <p
        onClick={(event) => {
          if (event.ctrlKey && event.shiftKey) {
            window.location.href = '/admin';
          }
        }}
        className="text-center font-mono text-xs text-ink/50"
      >
        {`© ${new Date().getFullYear()} World Kitchen Atlas. All content is original; unauthorized reproduction is prohibited.`}
      </p>
    </footer>
  );
}
