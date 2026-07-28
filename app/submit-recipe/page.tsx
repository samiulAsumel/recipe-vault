import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit a Recipe",
  description: "Share a dish for World Kitchen Atlas to research and add.",
  path: "/submit-recipe/",
});

export default function SubmitRecipePage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Submit a Recipe"
      description="Recipe submission form comes here."
    />
  );
}
