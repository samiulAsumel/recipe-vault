interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps): React.JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl text-ink">{title}</h1>
      <p className="mt-3 max-w-prose font-body text-ink/70">{description}</p>
    </main>
  );
}
