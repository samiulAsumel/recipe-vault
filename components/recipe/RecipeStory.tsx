import type { Story } from "@/lib/types/recipe";

interface RecipeStoryProps {
  story: Story;
}

const FIELDS: Array<{ key: keyof Story; label: string }> = [
  { key: "history", label: "History" },
  { key: "origin", label: "Origin" },
  { key: "culturalSignificance", label: "Cultural significance" },
  { key: "traditionalBackground", label: "Traditional background" },
];

export function RecipeStory({ story }: RecipeStoryProps): React.JSX.Element | null {
  const entries = FIELDS.filter(({ key }) => isNonEmptyString(story[key]));
  const facts = story.interestingFacts ?? [];

  if (entries.length === 0 && facts.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl text-ink">Story</h2>
      {entries.length > 0 && (
        <dl className="flex flex-col gap-4">
          {entries.map(({ key, label }) => (
            <div key={key}>
              <dt className="font-meta text-xs uppercase tracking-wide text-ink/50">{label}</dt>
              <dd className="mt-1 font-body text-sm text-ink/80">{story[key] as string}</dd>
            </div>
          ))}
        </dl>
      )}
      {facts.length > 0 && (
        <div>
          <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
            Interesting facts
          </h3>
          <ul className="mt-1 flex flex-col gap-1.5 font-body text-sm text-ink/80">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
