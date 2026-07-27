import type { Metadata } from 'next';
import MealTimeHub from '@/components/hub/MealTimeHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Breakfast Recipes',
  description: 'Traditional breakfast dishes from around the world.',
  alternates: { canonical: '/breakfast' },
};

export default function BreakfastPage({ searchParams }: PageProps): React.ReactElement {
  return <MealTimeHub slug="breakfast" searchParams={searchParams} />;
}
