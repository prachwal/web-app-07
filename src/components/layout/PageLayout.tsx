import { SkipLink } from './SkipLink';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageLayoutProps {
  /** Page content rendered inside `<main>`. */
  children: React.ReactNode;
  /** Value of the `id` attribute on `<main>`. Defaults to `"main-content"`. */
  mainId?: string;
}

/**
 * Standard full-page layout: skip link, sticky header, main content area, footer.
 * Shared by all top-level pages to ensure consistent composition.
 *
 * @param props - {@link PageLayoutProps}
 * @returns The page shell element
 */
export function PageLayout({
  children,
  mainId = 'main-content',
}: PageLayoutProps): React.JSX.Element {
  return (
    <>
      <SkipLink />
      <Header />
      <main id={mainId} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
