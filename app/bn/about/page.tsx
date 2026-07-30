import type { Metadata } from "next";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { bn as dict } from "@/lib/i18n/dictionaries/bn";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: dict.about.metaTitle,
  description: dict.about.metaDescription,
  path: "/bn/about/",
});

export default function AboutPageBn(): React.JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-4xl text-ink">{dict.about.heading}</h1>
        <AtlasRule />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">{dict.about.whatThisIs.heading}</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">{dict.about.whatThisIs.body}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">{dict.about.coverageVaries.heading}</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">{dict.about.coverageVaries.body}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">{dict.about.noInvented.heading}</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">{dict.about.noInvented.body}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">{dict.about.confidenceLevels.heading}</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          {dict.about.confidenceLevels.body}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">{dict.about.somethingInaccurate.heading}</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          {dict.about.somethingInaccurate.body}
        </p>
      </section>
    </main>
  );
}
