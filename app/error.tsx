'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-6 text-ink">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-paprika">Error</p>
        <h1 className="mt-2 font-display text-3xl">Something went wrong</h1>
        <p className="mt-4 text-ink/70">
          This entry couldn&apos;t be loaded. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 border border-clay-line px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-turmeric"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
