import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Street Food" };

export default function StreetFoodPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Street Food"
      description="Occasion hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
