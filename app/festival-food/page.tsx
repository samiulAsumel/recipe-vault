import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Festival Food" };

export default function FestivalFoodPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Festival Food"
      description="Occasion hub — cross-country dish card grid + filter bar comes here."
    />
  );
}
