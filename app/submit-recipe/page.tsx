import type { Metadata } from 'next';
import { RouteStub } from '@/components/RouteStub';

export const metadata: Metadata = {
  title: 'Submit a Recipe',
  alternates: { canonical: '/submit-recipe' },
};

export default function SubmitRecipePage(): React.ReactElement {
  return <RouteStub title="Submit a Recipe" path="/submit-recipe" />;
}
