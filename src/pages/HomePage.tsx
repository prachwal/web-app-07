import { SkipLink } from '@/components/layout/SkipLink';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/hero/HeroSection';
import { Footer } from '@/components/layout/Footer';

/**
 * Home page — full layout with skip link, header, hero section, and footer.
 *
 * @returns The home page element
 */
export function HomePage(): React.JSX.Element {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
