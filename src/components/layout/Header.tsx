import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/themeSlice';
import { setLocale, type Locale } from '@/store/slices/localeSlice';
import { ROUTES } from '@/routes/routes';

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'about', to: ROUTES.ABOUT },
  { key: 'contact', to: ROUTES.CONTACT },
  { key: 'settings', to: ROUTES.SETTINGS },
  { key: 'nbp', to: ROUTES.NBP },
] as const;

function isActive(to: string, pathname: string): boolean {
  return to === ROUTES.HOME ? pathname === '/' : pathname.startsWith(to);
}

/**
 * Application header.
 *
 * Desktop: logo | nav links | theme + locale toggles
 * Mobile:  hamburger (left) | logo (center) | theme + locale (right)
 *
 * Mobile drawer slides in from the LEFT using a CSS transition —
 * no framer-motion on the panel itself, which eliminates exit-animation
 * race conditions when uiPreferences flags are toggled mid-flight.
 * The backdrop uses a simple opacity CSS transition.
 */
export function Header(): React.JSX.Element {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const location = useLocation();
  const currentTheme = useAppSelector((state) => state.theme.mode);
  const currentLocale = useAppSelector((state) => state.locale.locale);

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  // Close on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closeMobile();
  }, [location.pathname, closeMobile]);

  const themeOptions: { mode: ThemeMode; label: string; Icon: React.ElementType }[] = [
    { mode: 'light', label: t('theme.light'), Icon: Sun },
    { mode: 'dark', label: t('theme.dark'), Icon: Moon },
    { mode: 'system', label: t('theme.system'), Icon: Monitor },
  ];

  const localeOptions: { locale: Locale; label: string }[] = [
    { locale: 'en', label: 'EN' },
    { locale: 'pl', label: 'PL' },
  ];

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">

          {/* ── Mobile: hamburger LEFT ── */}
          <button
            type="button"
            aria-label={mobileOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={toggleMobile}
            className={cn(
              'mr-3 rounded-md p-2 text-muted-foreground transition-colors sm:hidden',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {mobileOpen
              ? <X size={20} aria-hidden="true" />
              : <Menu size={20} aria-hidden="true" />
            }
          </button>

          {/* ── Logo ── */}
          <Link
            to={ROUTES.HOME}
            className="text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="DemoApp — strona główna"
          >
            DemoApp
          </Link>

          {/* ── Desktop nav ── */}
          <nav
            role="navigation"
            aria-label={t('a11y.openMenu')}
            className="ml-8 hidden sm:block"
          >
            <ul className="flex gap-6">
              {NAV_ITEMS.map(({ key, to }) => (
                <li key={key}>
                  <Link
                    to={to}
                    aria-current={isActive(to, location.pathname) ? 'page' : undefined}
                    className={cn(
                      'text-sm font-medium transition-colors rounded-sm',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                      isActive(to, location.pathname)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Theme toggle (desktop) ── */}
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

          {/* ── Locale toggle (desktop) ── */}
          <div
            className="ml-2 hidden sm:flex rounded-lg border border-border p-0.5"
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

          {/* ── Mobile: theme + locale compact (right side, always visible) ── */}
          <div className="flex items-center gap-1 sm:hidden">
            {/* Single theme cycle button on mobile */}
            <button
              type="button"
              onClick={() => {
                const next: ThemeMode =
                  currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
                dispatch(setTheme(next));
              }}
              aria-label={t('theme.toggle')}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {currentTheme === 'dark'
                ? <Moon size={18} aria-hidden="true" />
                : currentTheme === 'light'
                  ? <Sun size={18} aria-hidden="true" />
                  : <Monitor size={18} aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer — rendered outside header so it overlays full page ── */}
      <MobileNav
        open={mobileOpen}
        onClose={closeMobile}
        pathname={location.pathname}
        currentTheme={currentTheme}
        currentLocale={currentLocale}
        themeOptions={themeOptions}
        localeOptions={localeOptions}
        onThemeChange={(mode) => dispatch(setTheme(mode))}
        onLocaleChange={(locale) => dispatch(setLocale(locale))}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileNav — LEFT drawer, pure CSS transitions (no framer-motion on panel)
// ─────────────────────────────────────────────────────────────────────────────

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
  currentTheme: ThemeMode;
  currentLocale: Locale;
  themeOptions: { mode: ThemeMode; label: string; Icon: React.ElementType }[];
  localeOptions: { locale: Locale; label: string }[];
  onThemeChange: (mode: ThemeMode) => void;
  onLocaleChange: (locale: Locale) => void;
}

function MobileNav({
  open,
  onClose,
  pathname,
  currentTheme,
  currentLocale,
  themeOptions,
  localeOptions,
  onThemeChange,
  onLocaleChange,
}: MobileNavProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll + restore focus on close
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    // Focus first nav link after CSS transition (~200ms)
    const id = window.setTimeout(() => firstLinkRef.current?.focus(), 200);

    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus trap — keep Tab inside the drawer
  useEffect(() => {
    if (!open) return;
    const panel = document.getElementById('mobile-nav');
    if (!panel) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {/* Backdrop — CSS opacity transition, pointer-events controlled by open */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:hidden',
          'transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Panel — slides from LEFT via CSS transform */}
      <aside
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={t('a11y.openMenu')}
        tabIndex={-1}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(20rem,80vw)] flex-col sm:hidden',
          'border-r border-border bg-background shadow-2xl',
          'transition-transform duration-200 ease-out will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header row: title + close button */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{t('nav.menu')}</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('a11y.closeMenu')}
            className={cn(
              'rounded-md p-2 text-muted-foreground transition-colors',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label={t('a11y.openMenu')} className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ key, to }, index) => {
              const active = isActive(to, pathname);
              return (
                <li key={key}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    onClick={onClose}
                    className={cn(
                      'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'bg-primary/10 text-foreground ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: theme + locale controls */}
        <div className="shrink-0 border-t border-border px-4 py-4">
          <div className="flex items-end justify-between gap-4">
            {/* Theme */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t('theme.toggle')}
              </p>
              <div
                className="flex w-fit rounded-xl border border-border bg-muted/30 p-0.5"
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

            {/* Locale */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t('language.toggle')}
              </p>
              <div
                className="flex w-fit rounded-xl border border-border bg-muted/30 p-0.5"
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
      </aside>
    </>
  );
}
