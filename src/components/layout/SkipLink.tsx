import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * Accessibility skip navigation link.
 * Visually hidden until focused — allows keyboard users to skip repeated navigation.
 * Must be the first focusable element in the DOM.
 *
 * @returns Skip-to-content anchor element
 */
export function SkipLink(): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed left-4 top-4 z-50',
        'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
        'focus:outline-2 focus:outline-offset-2 focus:outline-ring',
      )}
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
