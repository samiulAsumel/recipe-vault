import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Submit a Recipe" };

export default function SubmitRecipePage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Submit a Recipe"
      description="Recipe submission form comes here."
    />
  );
}
