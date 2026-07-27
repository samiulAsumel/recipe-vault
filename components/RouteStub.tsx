import type { ContinentSlug } from '@/lib/constants';

interface RouteStubProps {
  title: string;
  path: string;
  region?: ContinentSlug;
  note?: string;
}

export function RouteStub({ title, path, region, note }: RouteStubProps): React.ReactElement {
  return (
    <main data-region={region} className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-1)]">
          {path}
        </p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        {note ? <p className="mt-4 text-base text-ink/70">{note}</p> : null}
        <div className="mt-8 h-px w-full bg-clay-line" />
        <p className="mt-4 font-mono text-xs text-ink/50">
          Phase 1 scaffold — content wired in a later phase.
        </p>
      </div>
    </main>
  );
}
