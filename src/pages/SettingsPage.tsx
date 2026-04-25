import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/themeSlice';
import { setLocale, type Locale } from '@/store/slices/localeSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import {
  selectUiPreferences,
  setAnimateBackdrop,
  setAnimatePanel,
  setCloseOnLink,
  setCloseOnEscape,
} from '@/store/slices/uiPreferencesSlice';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const themeOptions: { mode: ThemeMode; label: string; Icon: LucideIcon }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
];

const localeOptions: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'English' },
  { locale: 'pl', label: 'Polski' },
];

/**
 * Settings page for configuring theme, language, and testing notifications.
 *
 * @returns The settings page element
 */
export function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.theme.mode);
  const currentLocale = useAppSelector((state) => state.locale.locale);
  const uiPreferences = useAppSelector(selectUiPreferences);

  const mobileNavOptions = [
    {
      key: 'animateBackdrop',
      checked: uiPreferences.animateBackdrop,
      label: t('mobileNavigation.options.animateBackdrop.label'),
      description: t('mobileNavigation.options.animateBackdrop.description'),
      onChange: (checked: boolean) => dispatch(setAnimateBackdrop(checked)),
    },
    {
      key: 'animatePanel',
      checked: uiPreferences.animatePanel,
      label: t('mobileNavigation.options.animatePanel.label'),
      description: t('mobileNavigation.options.animatePanel.description'),
      onChange: (checked: boolean) => dispatch(setAnimatePanel(checked)),
    },
    {
      key: 'closeOnLink',
      checked: uiPreferences.closeOnLink,
      label: t('mobileNavigation.options.closeOnLink.label'),
      description: t('mobileNavigation.options.closeOnLink.description'),
      onChange: (checked: boolean) => dispatch(setCloseOnLink(checked)),
    },
    {
      key: 'closeOnEscape',
      checked: uiPreferences.closeOnEscape,
      label: t('mobileNavigation.options.closeOnEscape.label'),
      description: t('mobileNavigation.options.closeOnEscape.description'),
      onChange: (checked: boolean) => dispatch(setCloseOnEscape(checked)),
    },
  ] as const;

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('title')}</h1>

        {/* Appearance */}
        <section aria-labelledby="settings-appearance" className="mt-12">
          <h2 id="settings-appearance" className="text-xl font-semibold text-foreground">
            {t('appearance.heading')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('appearance.description')}</p>
          <div className="mt-4 flex gap-2" role="group" aria-label={tc('theme.toggle')}>
            {themeOptions.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => dispatch(setTheme(mode))}
                aria-pressed={currentTheme === mode}
                aria-label={label}
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors',
                  currentTheme === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section aria-labelledby="settings-language" className="mt-10">
          <h2 id="settings-language" className="text-xl font-semibold text-foreground">
            {t('language.heading')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('language.description')}</p>
          <div className="mt-4 flex gap-2" role="group" aria-label={tc('language.toggle')}>
            {localeOptions.map(({ locale, label }) => (
              <button
                key={locale}
                type="button"
                onClick={() => dispatch(setLocale(locale))}
                aria-pressed={currentLocale === locale}
                aria-label={label}
                className={cn(
                  'rounded-lg border border-border px-4 py-2 text-sm transition-colors',
                  currentLocale === locale
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="settings-mobile-navigation" className="mt-10">
          <h2 id="settings-mobile-navigation" className="text-xl font-semibold text-foreground">
            {t('mobileNavigation.heading')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('mobileNavigation.description')}</p>
          <div className="mt-4 space-y-3">
            {mobileNavOptions.map((option) => (
              <div
                key={option.key}
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-border px-4 py-3',
                  'bg-background transition-colors hover:bg-muted/40',
                )}
              >
                <input
                  id={`mobile-nav-${option.key}`}
                  type="checkbox"
                  checked={option.checked}
                  onChange={(event) => option.onChange(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
                <span className="min-w-0">
                  <label
                    htmlFor={`mobile-nav-${option.key}`}
                    className="block cursor-pointer text-sm font-medium text-foreground"
                  >
                    {option.label}
                  </label>
                  <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section aria-labelledby="settings-notifications" className="mt-10">
          <h2 id="settings-notifications" className="text-xl font-semibold text-foreground">
            {t('notifications.heading')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('notifications.description')}</p>
          <button
            type="button"
            onClick={() =>
              dispatch(addNotification({ type: 'info', message: t('notifications.testMessage') }))
            }
            className={cn(
              'mt-4 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground',
              'hover:bg-muted transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            )}
          >
            {t('notifications.testButton')}
          </button>
        </section>
      </div>
    </PageLayout>
  );
}
