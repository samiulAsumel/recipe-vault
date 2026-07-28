import { CONTINENTS } from "@/lib/constants";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const dynamicParams = false;

// See the note in [country]/page.tsx generateStaticParams — full ancestor path required.
// Phase 2 replaces this placeholder with real dish slugs from the GitHub JSON data layer.
export function generateStaticParams(): Array<{
  continent: string;
  country: string;
  dish: string;
}> {
  return CONTINENTS.map((continent) => ({
    continent: continent.slug,
    country: "sample-country",
    dish: "sample-dish",
  }));
}

export default async function DishPage({
  params,
}: {
  params: Promise<{ continent: string; country: string; dish: string }>;
}): Promise<React.JSX.Element> {
  const { dish } = await params;

  return (
    <PagePlaceholder
      title={dish}
      description="Recipe detail (full or discovery-only variant) comes here once the data layer is wired up."
    />
  );
}
