import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Snacks" };

export default function SnacksPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Snacks"
      description="Meal-time hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
