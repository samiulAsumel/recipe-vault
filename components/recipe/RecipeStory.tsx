import { getDictionary, type Locale } from "@/lib/i18n";
import type { Story } from "@/lib/types/recipe";

interface RecipeStoryProps {
  story: Story;
  /** translations.bn.story — a partial per-field Bengali override, merged
   * over the English story rather than replacing it wholesale, so a
   * half-translated story still shows every field (Bengali where translated,
   * English where not). */
  translatedStory?: Story;
  locale?: Locale;
}

const FIELD_KEYS: Array<keyof Story> = [
  "history",
  "origin",
  "culturalSignificance",
  "traditionalBackground",
];

export function RecipeStory({
  story,
  translatedStory,
  locale = "en",
}: RecipeStoryProps): React.JSX.Element | null {
  const dict = getDictionary(locale);
  const labels: Record<keyof Story, string> = {
    history: dict.recipeStory.history,
    origin: dict.recipeStory.origin,
    culturalSignificance: dict.recipeStory.culturalSignificance,
    traditionalBackground: dict.recipeStory.traditionalBackground,
    interestingFacts: "",
  };
  const merged = (key: keyof Story): string | undefined => {
    const override = translatedStory?.[key];
    return typeof override === "string" && override.trim().length > 0
      ? override
      : (story[key] as string | undefined);
  };
  const entries = FIELD_KEYS.filter((key) => isNonEmptyString(merged(key))).map((key) => ({
    key,
    label: labels[key],
    value: merged(key) as string,
  }));
  const facts =
    locale === "bn" && translatedStory?.interestingFacts && translatedStory.interestingFacts.length > 0
      ? translatedStory.interestingFacts
      : (story.interestingFacts ?? []);

  if (entries.length === 0 && facts.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl text-ink">{dict.recipeStory.heading}</h2>
      {entries.length > 0 && (
        <dl className="flex flex-col gap-4">
          {entries.map(({ key, label, value }) => (
            <div key={key}>
              <dt className="font-meta text-xs uppercase tracking-wide text-ink/50">{label}</dt>
              <dd className="mt-1 font-body text-sm text-ink/80">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {facts.length > 0 && (
        <div>
          <h3 className="font-meta text-xs uppercase tracking-wide text-ink/50">
            {dict.recipeStory.interestingFacts}
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
