import type { Metadata } from 'next';
import MealTimeHub from '@/components/hub/MealTimeHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Lunch Recipes',
  description: 'Traditional lunch dishes from around the world.',
  alternates: { canonical: '/lunch' },
};

export default function LunchPage({ searchParams }: PageProps): React.ReactElement {
  return <MealTimeHub slug="lunch" searchParams={searchParams} />;
}
