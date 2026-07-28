import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Breakfast" };

export default function BreakfastPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Breakfast"
      description="Meal-time hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
