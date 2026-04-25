import { PageLayout } from '@/components/layout/PageLayout';
import { HeroSection } from '@/components/hero/HeroSection';

/**
 * Home page — hero section wrapped in the standard page layout.
 *
 * @returns The home page element
 */
export function HomePage(): React.JSX.Element {
  return (
    <PageLayout>
      <HeroSection />
    </PageLayout>
  );
}
