import type { Metadata } from "next";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "World Kitchen Atlas's methodology and accuracy disclaimer — how dishes are researched, sourced, and confidence-rated.",
  path: "/about/",
});

export default function AboutPage(): React.JSX.Element {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-4xl text-ink">About</h1>
        <AtlasRule />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">What this is</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          World Kitchen Atlas aims for a real baseline of dishes for every country — main courses,
          street food, desserts, breads, and traditional drinks — organized by continent and
          country so a dish can always be traced back to where it actually comes from.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Coverage varies by country, honestly</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          Large, well-documented cuisines — India, China, Italy, France, Bangladesh, Japan, Mexico,
          Turkey, and others — get deep, confident coverage, often well beyond the baseline. Some
          very small nations (Pacific micro-states, or city-states like Vatican City, Liechtenstein,
          Monaco, San Marino) don&apos;t have that many distinctly documented dishes to draw from.
          For those, this atlas lists what can genuinely be confirmed and says so plainly, rather
          than padding the count with invented or generic filler.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">No invented dishes, no false precision</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          Every dish on this site is real — none are invented to round out a list. Where a dish&apos;s
          exact year of origin isn&apos;t certain (which is common for food history), the entry
          reflects general culinary consensus rather than asserting a precise date as fact.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Confidence levels</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          Every entry carries a confidence rating — shown as the tick marks on its Atlas Pin badge —
          reflecting how well-documented that dish&apos;s history and details are: three ticks for
          high confidence, down to one for entries built from thinner sourcing. It&apos;s a
          deliberate part of the design, not an afterthought: this atlas would rather show its
          uncertainty than hide it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Something inaccurate?</h2>
        <p className="font-body text-sm leading-relaxed text-ink/80">
          If a dish, origin, or historic note here looks wrong, it&apos;s worth flagging — this atlas
          is a work in progress, not a finished, authoritative record.
        </p>
      </section>
    </main>
  );
}
