import { PageLayout } from '@/components/layout/PageLayout';
import { HeroSection } from '@/components/hero/HeroSection';
import { ApiStatusCards } from '@/components/api-status';

/**
 * Home page — hero section and API status cards wrapped in the standard page layout.
 *
 * @returns The home page element
 */
export function HomePage(): React.JSX.Element {
  return (
    <PageLayout>
      <HeroSection>
        <ApiStatusCards />
      </HeroSection>
    </PageLayout>
  );
}
