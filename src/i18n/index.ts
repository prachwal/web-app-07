import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enHero from './locales/en/hero.json';
import plCommon from './locales/pl/common.json';
import plHero from './locales/pl/hero.json';
import type { Locale } from '@/store/slices/localeSlice';

/** Supported i18next namespaces. */
export type I18nNamespace = 'common' | 'hero';

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, hero: enHero },
    pl: { common: plCommon, hero: plHero },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

/**
 * Changes the active i18next language.
 * Call this in response to Redux `localeSlice` state changes.
 *
 * @param locale - Target locale to switch to
 */
export function changeLanguage(locale: Locale): void {
  void i18n.changeLanguage(locale);
}

export default i18n;
