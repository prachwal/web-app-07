import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Application footer with `contentinfo` landmark role.
 *
 * @returns The site footer element
 */
export function Footer(): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <footer
      role="contentinfo"
      className={cn('border-t border-border', 'bg-background py-8')}
    >
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} DemoApp.{' '}
          <a
            href="/about"
            className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {t('nav.about')}
          </a>
        </p>
      </div>
    </footer>
  );
}
