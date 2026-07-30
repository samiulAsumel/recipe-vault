import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { bn as dict } from "@/lib/i18n/dictionaries/bn";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: dict.submitRecipe.metaTitle,
  description: dict.submitRecipe.metaDescription,
  path: "/bn/submit-recipe/",
});

export default function SubmitRecipePageBn(): React.JSX.Element {
  return <PagePlaceholder title={dict.submitRecipe.title} description={dict.submitRecipe.description} />;
}
