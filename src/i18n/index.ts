import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { env } from '@/config/env';
import {
  FALLBACK_LANGUAGE,
  getLanguageDirection,
  RECOMMENDED_LANGUAGES,
  toLanguageCode,
} from '@/i18n/languages';
import { fallbackLanguage, resources } from '@/i18n/resources';

const supportedLngs = env.i18nSupportedLanguages;
const defaultLng = env.i18nDefaultLanguage;
const languageStorageKey = 'app_language';

function getBrowserLanguage() {
  return toLanguageCode(window.navigator.language);
}

function getStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(languageStorageKey);
    const parsed = toLanguageCode(stored);
    if (parsed && supportedLngs.includes(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function resolveInitialLanguage() {
  const stored = getStoredLanguage();
  if (stored) return stored;

  const browser = getBrowserLanguage();
  if (browser && supportedLngs.includes(browser)) return browser;
  if (supportedLngs.includes(defaultLng)) return defaultLng;
  return FALLBACK_LANGUAGE;
}

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: resolveInitialLanguage(),
      fallbackLng: fallbackLanguage,
      supportedLngs,
      defaultNS: 'translation',
      ns: ['translation'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: languageStorageKey,
      },
    });
}

export const languageRegistry = RECOMMENDED_LANGUAGES;
export const languageDirectionFor = getLanguageDirection;
export default i18n;
