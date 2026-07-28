import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtlasRule } from "@/components/atlas/AtlasRule";
import { CONTINENTS, isContinentSlug } from "@/lib/constants";
import { getCountriesByContinent } from "@/lib/data/source";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ continent: string }> {
  return CONTINENTS.map((continent) => ({ continent: continent.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ continent: string }>;
}): Promise<Metadata> {
  const { continent } = await params;
  const match = CONTINENTS.find((c) => c.slug === continent);
  const name = match?.name ?? continent;
  return {
    title: name,
    description: `Countries and dishes from ${name}, part of the World Kitchen Atlas.`,
  };
}

export default async function ContinentHubPage({
  params,
}: {
  params: Promise<{ continent: string }>;
}): Promise<React.JSX.Element> {
  const { continent } = await params;
  if (!isContinentSlug(continent)) {
    notFound();
  }
  const match = CONTINENTS.find((c) => c.slug === continent);
  const name = match?.name ?? continent;
  const countries = await getCountriesByContinent(continent);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-5xl text-ink">{name}</h1>
        <AtlasRule />
      </header>

      {countries.length === 0 ? (
        <p className="border border-dashed border-clay-line p-8 text-center font-body text-sm text-ink/60">
          No countries documented for {name} yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <Link
              key={country.slug}
              href={`/${continent}/${country.slug}/`}
              className="flex flex-col gap-2 border border-clay-line bg-parchment p-5 transition-colors hover:border-ink"
            >
              <span className="h-1 w-10" style={{ backgroundColor: "var(--accent-1)" }} />
              <h2 className="font-display text-xl text-ink">{country.name}</h2>
              <p className="font-meta text-xs text-ink/60">
                {country.dishCount} {country.dishCount === 1 ? "dish" : "dishes"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
