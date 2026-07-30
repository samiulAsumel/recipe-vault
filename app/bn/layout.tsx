/** Scopes the [lang="bn"] CSS in globals.css (Bengali font swap) to every
 * page under /bn/. The shared root layout.tsx still renders <html lang="en">
 * and SiteHeader/SiteFooter unconditionally — those two components set their
 * own `lang="bn"` directly (see components/layout/SiteHeader.tsx /
 * SiteFooter.tsx) since they render outside this layout's {children} slot. */
export default function BengaliLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div lang="bn">{children}</div>;
}
