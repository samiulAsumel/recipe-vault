import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Search"
      description="Filter sidebar (continent, meal-time, dietary, occasion) + Fuse.js result grid comes here."
    />
  );
}
