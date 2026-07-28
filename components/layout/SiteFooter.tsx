export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-clay-line">
      <div className="mx-auto max-w-6xl px-6 py-8 font-meta text-xs text-ink/60">
        © {new Date().getFullYear()} World Kitchen Atlas
      </div>
    </footer>
  );
}
