import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Dinner" };

export default function DinnerPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Dinner"
      description="Meal-time hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
