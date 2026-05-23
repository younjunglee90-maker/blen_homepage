import { FALLBACK_LANGUAGE, type LanguageCode } from '@/i18n/languages';

import en from '@/i18n/locales/en.json';
import ko from '@/i18n/locales/ko.json';
import pagesEn from '@/i18n/locales/pages.en.json';
import pagesKo from '@/i18n/locales/pages.ko.json';

function mergeTranslations(
  base: Record<string, unknown>,
  pages: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...base,
    menu: { ...(base.menu as object), ...(pages.menu as object) },
    common: { ...(base.common as object), ...(pages.common as object) },
    termsPage: pages.termsPage,
    privacyPage: pages.privacyPage,
    supportPage: pages.supportPage,
  };
}

export const resources: Record<LanguageCode, { translation: Record<string, unknown> }> = {
  en: { translation: mergeTranslations(en, pagesEn) },
  ko: { translation: mergeTranslations(ko, pagesKo) },
};

export const fallbackLanguage = FALLBACK_LANGUAGE;
