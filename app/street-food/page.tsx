import type { Metadata } from 'next';
import OccasionHub from '@/components/hub/OccasionHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Street Food Recipes',
  description: 'Traditional street food dishes from around the world.',
  alternates: { canonical: '/street-food' },
};

export default function StreetFoodPage({ searchParams }: PageProps): React.ReactElement {
  return <OccasionHub slug="street-food" searchParams={searchParams} />;
}
