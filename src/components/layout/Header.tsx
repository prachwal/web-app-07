import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/themeSlice';
import { setLocale, type Locale } from '@/store/slices/localeSlice';
import type { LucideIcon } from 'lucide-react';

/**
 * Application header with navigation, theme toggle, and language switcher.
 * Uses `role="banner"` landmark and keyboard-accessible controls.
 *
 * @returns The site header element
 */
export function Header(): React.JSX.Element {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.theme.mode);
  const currentLocale = useAppSelector((state) => state.locale.locale);

  const themeOptions: { mode: ThemeMode; label: string; Icon: LucideIcon }[] = [
    { mode: 'light', label: t('theme.light'), Icon: Sun },
    { mode: 'dark', label: t('theme.dark'), Icon: Moon },
    { mode: 'system', label: t('theme.system'), Icon: Monitor },
  ];

  const localeOptions: { locale: Locale; label: string }[] = [
    { locale: 'en', label: 'EN' },
    { locale: 'pl', label: 'PL' },
  ];

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border',
        'bg-background/80 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Demo App — go to home"
        >
          DemoApp
        </a>

        <nav role="navigation" aria-label={t('a11y.openMenu')}>
          <ul className="hidden gap-6 sm:flex" role="list">
            {(['home', 'about', 'contact'] as const).map((key) => (
              <li key={key}>
                <a
                  href={key === 'home' ? '/' : `/${key}`}
                  className={cn(
                    'text-sm font-medium text-muted-foreground',
                    'hover:text-foreground transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm',
                  )}
                >
                  {t(`nav.${key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2" role="toolbar" aria-label="Site controls">
          {/* Theme toggle */}
          <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label={t('theme.toggle')}>
            {themeOptions.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => dispatch(setTheme(mode))}
                aria-pressed={currentTheme === mode}
                aria-label={label}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  currentTheme === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={14} aria-hidden="true" />
              </button>
            ))}
          </div>

          {/* Language toggle */}
          <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label={t('language.toggle')}>
            {localeOptions.map(({ locale, label }) => (
              <button
                key={locale}
                type="button"
                onClick={() => dispatch(setLocale(locale))}
                aria-pressed={currentLocale === locale}
                aria-label={t(`language.${locale}`)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                  currentLocale === locale
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
