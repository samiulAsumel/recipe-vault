import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Lunch" };

export default function LunchPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Lunch"
      description="Meal-time hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
