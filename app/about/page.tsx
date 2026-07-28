import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "About" };

export default function AboutPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="About"
      description="Methodology and accuracy disclaimer land here."
    />
  );
}
