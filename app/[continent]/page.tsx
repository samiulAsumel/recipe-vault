import type { Metadata } from "next";
import { CONTINENTS } from "@/lib/constants";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

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
  return { title: match?.name ?? continent };
}

export default async function ContinentHubPage({
  params,
}: {
  params: Promise<{ continent: string }>;
}): Promise<React.JSX.Element> {
  const { continent } = await params;
  const match = CONTINENTS.find((c) => c.slug === continent);

  return (
    <PagePlaceholder
      title={match?.name ?? continent}
      description="Country grid — name, dish count, flag-color sliver — comes here once the data layer is wired up."
    />
  );
}
