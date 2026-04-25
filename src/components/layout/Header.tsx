import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/themeSlice';
import { setLocale, type Locale } from '@/store/slices/localeSlice';
import { selectUiPreferences } from '@/store/slices/uiPreferencesSlice';
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
  const uiPreferences = useAppSelector(selectUiPreferences);

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

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

      <MobileNavDrawer
        open={mobileOpen}
        onClose={closeMobile}
        pathname={location.pathname}
        currentTheme={currentTheme}
        currentLocale={currentLocale}
        animateBackdrop={uiPreferences.animateBackdrop}
        animatePanel={uiPreferences.animatePanel}
        closeOnLink={uiPreferences.closeOnLink}
        closeOnEscape={uiPreferences.closeOnEscape}
        themeOptions={themeOptions}
        localeOptions={localeOptions}
        onThemeChange={(mode) => dispatch(setTheme(mode))}
        onLocaleChange={(locale) => dispatch(setLocale(locale))}
      />
    </header>
  );
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  currentTheme: ThemeMode;
  currentLocale: Locale;
  animateBackdrop: boolean;
  animatePanel: boolean;
  closeOnLink: boolean;
  closeOnEscape: boolean;
  themeOptions: { mode: ThemeMode; label: string; Icon: LucideIcon }[];
  localeOptions: { locale: Locale; label: string }[];
  onThemeChange: (mode: ThemeMode) => void;
  onLocaleChange: (locale: Locale) => void;
}

function MobileNavDrawer({
  open,
  onClose,
  pathname,
  currentTheme,
  currentLocale,
  animateBackdrop,
  animatePanel,
  closeOnLink,
  closeOnEscape,
  themeOptions,
  localeOptions,
  onThemeChange,
  onLocaleChange,
}: MobileNavDrawerProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    if (!open) return;

    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      if (firstLinkRef.current) {
        firstLinkRef.current.focus();
      } else {
        panelRef.current?.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!closeOnEscape) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeOnEscape, onClose, open]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    if (open && closeOnLink && previousPath !== pathname) {
      onClose();
    }
  }, [closeOnLink, onClose, open, pathname]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden" aria-hidden={false}>
          <motion.div
            data-testid="mobile-nav-backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={animateBackdrop ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={animateBackdrop ? { opacity: 0 } : undefined}
            transition={animateBackdrop ? { duration: 0.18 } : { duration: 0 }}
          />

          <motion.aside
            ref={panelRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t('a11y.openMenu')}
            tabIndex={-1}
            initial={animatePanel ? { x: '100%' } : false}
            animate={{ x: 0 }}
            exit={animatePanel ? { x: '100%' } : undefined}
            transition={animatePanel ? { type: 'spring', damping: 28, stiffness: 300 } : { duration: 0 }}
            className={cn(
              'absolute right-0 top-0 flex h-[100dvh] w-[min(22rem,85vw)] flex-col overflow-hidden',
              'border-l border-border bg-background shadow-2xl',
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t('a11y.openMenu')}
                </p>
                <h2 className="mt-1 text-[1.05rem] font-semibold leading-tight text-foreground">
                  {t('nav.menu')}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t('a11y.closeMenu')}
                className={cn(
                  'rounded-md p-2 text-muted-foreground transition-colors',
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
                <nav aria-label={t('a11y.openMenu')}>
                  <ul className="flex flex-col gap-1.5">
                    {NAV_ITEMS.map(({ key, to }, index) => {
                      const isActive =
                        to === ROUTES.HOME ? pathname === '/' : pathname.startsWith(to);
                      return (
                        <li key={key}>
                          <Link
                            ref={index === 0 ? firstLinkRef : undefined}
                            to={to}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={closeOnLink ? onClose : undefined}
                            className={cn(
                              'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              isActive
                                ? 'bg-primary/10 text-foreground shadow-[inset_0_0_0_1px] shadow-primary/10'
                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                            )}
                          >
                            {t(`nav.${key}`)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              <div className="shrink-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                  <div className="min-w-0">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t('theme.toggle')}
                    </p>
                    <div
                      className="flex w-fit rounded-xl border border-border bg-background p-0.5"
                      role="group"
                      aria-label={t('theme.toggle')}
                    >
                      {themeOptions.map(({ mode, label, Icon }) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => onThemeChange(mode)}
                          aria-pressed={currentTheme === mode}
                          aria-label={label}
                          className={cn(
                            'rounded-lg p-2.5 transition-colors',
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

                  <div className="min-w-0 text-right">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t('language.toggle')}
                    </p>
                    <div
                      className="flex w-fit rounded-xl border border-border bg-background p-0.5"
                      role="group"
                      aria-label={t('language.toggle')}
                    >
                      {localeOptions.map(({ locale, label }) => (
                        <button
                          key={locale}
                          type="button"
                          onClick={() => onLocaleChange(locale)}
                          aria-pressed={currentLocale === locale}
                          aria-label={t(`language.${locale}`)}
                          className={cn(
                            'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
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
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
