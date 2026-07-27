import type { Metadata } from 'next';
import MealTimeHub from '@/components/hub/MealTimeHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Drink Recipes',
  description: 'Traditional drinks from around the world.',
  alternates: { canonical: '/drinks' },
};

export default function DrinksPage({ searchParams }: PageProps): React.ReactElement {
  return <MealTimeHub slug="drinks" searchParams={searchParams} />;
}
