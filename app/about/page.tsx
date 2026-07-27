import type { Metadata } from 'next';
import { RouteStub } from '@/components/RouteStub';

export const metadata: Metadata = {
  title: 'About',
  description: 'Methodology and accuracy disclaimer for World Kitchen Atlas.',
  alternates: { canonical: '/about' },
};

export default function AboutPage(): React.ReactElement {
  return <RouteStub title="About" path="/about" note="Methodology + accuracy disclaimer" />;
}
