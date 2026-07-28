import { CONTINENTS } from "@/lib/constants";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const dynamicParams = false;

// Each level returns the FULL ancestor path, not just its own segment — Next.js
// (vercel/next.js#55574) doesn't reliably merge per-segment generateStaticParams
// across 3+ nested dynamic route levels under output: 'export'. Phase 2 replaces
// this placeholder with real country slugs from the GitHub JSON data layer.
export function generateStaticParams(): Array<{ continent: string; country: string }> {
  return CONTINENTS.map((continent) => ({
    continent: continent.slug,
    country: "sample-country",
  }));
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ continent: string; country: string }>;
}): Promise<React.JSX.Element> {
  const { country } = await params;

  return (
    <PagePlaceholder
      title={country}
      description="Sticky filter bar, dish card grid, and a traditional-drinks strip come here once the data layer is wired up."
    />
  );
}
