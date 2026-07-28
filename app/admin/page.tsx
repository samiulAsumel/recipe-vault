import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage(): React.JSX.Element {
  return (
    <PagePlaceholder
      title="Admin"
      description="Login, analytics dashboard, and recipe management land here in a later phase."
    />
  );
}
