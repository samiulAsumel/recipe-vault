export default async function ContinentLayoutBn({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ continent: string }>;
}): Promise<React.JSX.Element> {
  const { continent } = await params;
  return <div data-region={continent}>{children}</div>;
}
