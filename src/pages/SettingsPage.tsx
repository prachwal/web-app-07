import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsSection } from '@/components/layout/SettingsSection';
import { ToggleGroup } from '@/components/ui/ToggleGroup';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/themeSlice';
import { setLocale, type Locale } from '@/store/slices/localeSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import {
  selectUiPreferences,
  setReduceMotion,
  setNotificationsEnabled,
} from '@/store/slices/uiPreferencesSlice';
import { cn } from '@/lib/utils';

const themeOptions = [
  { value: 'light' as ThemeMode, label: 'Jasny', icon: <Sun size={16} aria-hidden="true" /> },
  { value: 'dark' as ThemeMode, label: 'Ciemny', icon: <Moon size={16} aria-hidden="true" /> },
  { value: 'system' as ThemeMode, label: 'Systemowy', icon: <Monitor size={16} aria-hidden="true" /> },
];

const localeOptions = [
  { value: 'en' as Locale, label: 'English' },
  { value: 'pl' as Locale, label: 'Polski' },
];

interface SettingsToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function SettingsToggleRow({ id, label, description, checked, onChange }: SettingsToggleRowProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border border-border px-4 py-3',
      'bg-background transition-colors hover:bg-muted/40',
    )}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <span className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}

export function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.theme.mode);
  const currentLocale = useAppSelector((state) => state.locale.locale);
  const { reduceMotion, notificationsEnabled } = useAppSelector(selectUiPreferences);

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title={t('title')} />

        <SettingsSection
          id="settings-appearance"
          title={t('appearance.heading')}
          description={t('appearance.description')}
          className="mt-12"
        >
          <ToggleGroup
            options={themeOptions}
            value={currentTheme}
            onChange={(mode) => dispatch(setTheme(mode))}
            ariaLabel={tc('theme.toggle')}
          />
        </SettingsSection>

        <SettingsSection
          id="settings-language"
          title={t('language.heading')}
          description={t('language.description')}
        >
          <ToggleGroup
            options={localeOptions}
            value={currentLocale}
            onChange={(locale) => dispatch(setLocale(locale))}
            ariaLabel={tc('language.toggle')}
          />
        </SettingsSection>

        <SettingsSection
          id="settings-accessibility"
          title="Dostępność i animacje"
          description="Dostosuj zachowanie interfejsu."
        >
          <div className="space-y-3">
            <SettingsToggleRow
              id="pref-reduce-motion"
              label="Ogranicz animacje"
              description="Wyłącza efekty przejść i animacje wejścia na stronach."
              checked={reduceMotion}
              onChange={(v) => dispatch(setReduceMotion(v))}
            />
            <SettingsToggleRow
              id="pref-notifications"
              label="Powiadomienia toast"
              description="Pokazuj krótkie powiadomienia po akcjach (np. wysłanie formularza)."
              checked={notificationsEnabled}
              onChange={(v) => dispatch(setNotificationsEnabled(v))}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          id="settings-notifications"
          title={t('notifications.heading')}
          description={t('notifications.description')}
        >
          <button
            type="button"
            onClick={() =>
              dispatch(addNotification({ type: 'info', message: t('notifications.testMessage') }))
            }
            className={cn(
              'rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground',
              'hover:bg-muted transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            )}
          >
            {t('notifications.testButton')}
          </button>
        </SettingsSection>
      </div>
    </PageLayout>
  );
}
