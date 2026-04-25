import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enHero from './locales/en/hero.json';
import enAbout from './locales/en/about.json';
import enContact from './locales/en/contact.json';
import enSettings from './locales/en/settings.json';
import enNbp from './locales/en/nbp.json';
import plCommon from './locales/pl/common.json';
import plHero from './locales/pl/hero.json';
import plAbout from './locales/pl/about.json';
import plContact from './locales/pl/contact.json';
import plSettings from './locales/pl/settings.json';
import plNbp from './locales/pl/nbp.json';
import type { Locale } from '@/store/slices/localeSlice';

/** Supported i18next namespaces. */
export type I18nNamespace = 'common' | 'hero' | 'about' | 'contact' | 'settings' | 'nbp';

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      hero: enHero,
      about: enAbout,
      contact: enContact,
      settings: enSettings,
      nbp: enNbp,
    },
    pl: {
      common: plCommon,
      hero: plHero,
      about: plAbout,
      contact: plContact,
      settings: plSettings,
      nbp: plNbp,
    },
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
