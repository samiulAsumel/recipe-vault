import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "World Kitchen Atlas's methodology and accuracy disclaimer — how dishes are researched, sourced, and confidence-rated.",
  path: "/about/",
});

export default function AboutPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="About"
      description="Methodology and accuracy disclaimer land here."
    />
  );
}
