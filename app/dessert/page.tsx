import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Dessert" };

export default function DessertPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Dessert"
      description="Meal-time hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
