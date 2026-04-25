import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/themeSlice';
import { setLocale, type Locale } from '@/store/slices/localeSlice';
import { ROUTES } from '@/routes/routes';
import type { LucideIcon } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'about', to: ROUTES.ABOUT },
  { key: 'contact', to: ROUTES.CONTACT },
  { key: 'settings', to: ROUTES.SETTINGS },
  { key: 'nbp', to: ROUTES.NBP },
] as const;

/**
 * Application header with navigation, theme toggle, and language switcher.
 * Uses `role="banner"` landmark and keyboard-accessible controls.
 * Active route is highlighted with `aria-current="page"`.
 *
 * @returns The site header element
 */
export function Header(): React.JSX.Element {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const currentTheme = useAppSelector((state) => state.theme.mode);
  const currentLocale = useAppSelector((state) => state.locale.locale);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLevel, setMobileLevel] = useState<'nav' | 'settings'>('nav');
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileLevel('nav');
  }, []);

  // Close on route change
  useEffect(() => {
    if (mobileOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileOpen(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileLevel('nav');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobile();
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobile]);

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
        <Link
          to={ROUTES.HOME}
          className="text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Demo App — go to home"
        >
          DemoApp
        </Link>

        <nav role="navigation" aria-label={t('a11y.openMenu')}>
          <ul className="hidden gap-6 sm:flex">
            {NAV_ITEMS.map(({ key, to }) => {
              const isActive =
                to === ROUTES.HOME ? location.pathname === '/' : location.pathname.startsWith(to);
              return (
                <li key={key}>
                  <Link
                    to={to}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'text-sm font-medium transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2" role="toolbar" aria-label="Site controls">
          {/* Mobile hamburger — visible only on mobile */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-label={mobileOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              'rounded-md p-2 text-muted-foreground transition-colors sm:hidden',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>

          {/* Theme toggle — hidden on mobile (available in mobile nav) */}
          <div
            className="hidden sm:flex rounded-lg border border-border p-0.5"
            role="group"
            aria-label={t('theme.toggle')}
          >
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

          {/* Language toggle — hidden on mobile (available in mobile nav) */}
          <div
            className="hidden sm:flex rounded-lg border border-border p-0.5"
            role="group"
            aria-label={t('language.toggle')}
          >
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

      {/* Mobile full-screen nav overlay — two levels */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t('a11y.openMenu')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'fixed inset-0 top-16 z-50 flex flex-col overflow-y-auto sm:hidden',
              'bg-background/95 backdrop-blur-md',
            )}
          >
            <AnimatePresence mode="wait">
              {mobileLevel === 'nav' ? (
                <motion.div
                  key="level1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col px-4 py-6"
                >
                  <nav aria-label={t('a11y.openMenu')}>
                    <ul className="flex flex-col gap-1">
                      {NAV_ITEMS.map(({ key, to }) => {
                        const isActive =
                          to === ROUTES.HOME
                            ? location.pathname === '/'
                            : location.pathname.startsWith(to);
                        return (
                          <li key={key}>
                            <Link
                              to={to}
                              aria-current={isActive ? 'page' : undefined}
                              onClick={closeMobile}
                              className={cn(
                                'flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                isActive
                                  ? 'bg-primary/10 text-foreground'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              )}
                            >
                              {t(`nav.${key}`)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="mt-6 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setMobileLevel('settings')}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium',
                        'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                    >
                      {t('nav.settings')}
                      <span aria-hidden="true" className="text-muted-foreground">›</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="level2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col px-4 py-6"
                >
                  <button
                    type="button"
                    onClick={() => setMobileLevel('nav')}
                    className={cn(
                      'mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground',
                      'transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  >
                    <span aria-hidden="true">‹</span>
                    {t('a11y.back')}
                  </button>

                  <div className="flex flex-col gap-6 px-4">
                    {/* Theme */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('theme.toggle')}
                      </p>
                      <div
                        className="flex rounded-lg border border-border p-0.5 w-fit"
                        role="group"
                        aria-label={t('theme.toggle')}
                      >
                        {themeOptions.map(({ mode, label, Icon }) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => dispatch(setTheme(mode))}
                            aria-pressed={currentTheme === mode}
                            aria-label={label}
                            className={cn(
                              'rounded-md p-2 transition-colors',
                              currentTheme === mode
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            <Icon size={16} aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('language.toggle')}
                      </p>
                      <div
                        className="flex rounded-lg border border-border p-0.5 w-fit"
                        role="group"
                        aria-label={t('language.toggle')}
                      >
                        {localeOptions.map(({ locale, label }) => (
                          <button
                            key={locale}
                            type="button"
                            onClick={() => dispatch(setLocale(locale))}
                            aria-pressed={currentLocale === locale}
                            aria-label={t(`language.${locale}`)}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
