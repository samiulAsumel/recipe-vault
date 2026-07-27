import type { Metadata } from 'next';
import MealTimeHub from '@/components/hub/MealTimeHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Dinner Recipes',
  description: 'Traditional dinner dishes from around the world.',
  alternates: { canonical: '/dinner' },
};

export default function DinnerPage({ searchParams }: PageProps): React.ReactElement {
  return <MealTimeHub slug="dinner" searchParams={searchParams} />;
}
