import type { Metadata } from 'next';
import MealTimeHub from '@/components/hub/MealTimeHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Snack Recipes',
  description: 'Traditional snacks from around the world.',
  alternates: { canonical: '/snacks' },
};

export default function SnacksPage({ searchParams }: PageProps): React.ReactElement {
  return <MealTimeHub slug="snacks" searchParams={searchParams} />;
}
