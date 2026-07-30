import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { bn as dict } from "@/lib/i18n/dictionaries/bn";

export default function NotFoundBn(): React.JSX.Element {
  return <PagePlaceholder title={dict.notFound.title} description={dict.notFound.description} />;
}
