import type { Metadata } from 'next';
import MealTimeHub from '@/components/hub/MealTimeHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Dessert Recipes',
  description: 'Traditional desserts from around the world.',
  alternates: { canonical: '/dessert' },
};

export default function DessertPage({ searchParams }: PageProps): React.ReactElement {
  return <MealTimeHub slug="dessert" searchParams={searchParams} />;
}
