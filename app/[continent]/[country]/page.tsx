import { CONTINENTS } from "@/lib/constants";
import { getCountriesByContinent } from "@/lib/data/source";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const dynamicParams = false;

// Each level returns the FULL ancestor path, not just its own segment — Next.js
// (vercel/next.js#55574) doesn't reliably merge per-segment generateStaticParams
// across 3+ nested dynamic route levels under output: 'export'.
export async function generateStaticParams(): Promise<Array<{ continent: string; country: string }>> {
  const perContinent = await Promise.all(
    CONTINENTS.map(async (continent) => {
      const countries = await getCountriesByContinent(continent.slug);
      return countries.map((country) => ({ continent: continent.slug, country: country.slug }));
    }),
  );
  return perContinent.flat();
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
