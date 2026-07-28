import { getAllDishes } from "@/lib/data/source";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const dynamicParams = false;

// See the note in [country]/page.tsx generateStaticParams — full ancestor path required.
export async function generateStaticParams(): Promise<
  Array<{
    continent: string;
    country: string;
    dish: string;
  }>
> {
  const dishes = await getAllDishes();
  return dishes.map((dish) => ({
    continent: dish.continentSlug,
    country: dish.countrySlug,
    dish: dish.slug,
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
