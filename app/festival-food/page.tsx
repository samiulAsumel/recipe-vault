import type { Metadata } from 'next';
import OccasionHub from '@/components/hub/OccasionHub';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Festival Food Recipes',
  description: 'Traditional festival dishes from around the world.',
  alternates: { canonical: '/festival-food' },
};

export default function FestivalFoodPage({ searchParams }: PageProps): React.ReactElement {
  return <OccasionHub slug="festival-food" searchParams={searchParams} />;
}
