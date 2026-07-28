import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Drinks" };

export default function DrinksPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Drinks"
      description="Meal-time hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
