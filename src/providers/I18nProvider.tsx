import { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { changeLanguage } from '@/i18n';

/**
 * Synchronizes the Redux locale state with i18next.
 * When `localeSlice` changes, calls `i18n.changeLanguage()` automatically.
 *
 * @returns null — renders nothing, only handles side effects
 */
export function I18nProvider(): null {
  const locale = useAppSelector((state) => state.locale.locale);

  useEffect(() => {
    changeLanguage(locale);
  }, [locale]);

  return null;
}
