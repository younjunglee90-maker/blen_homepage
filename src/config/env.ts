export type LanguageCode = 'en' | 'ko';

const allowedLanguages = ['en', 'ko'] as const;

function normalizeLanguageCode(input: string | null | undefined): LanguageCode | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase().split('-')[0];
  if (!normalized) return null;
  return allowedLanguages.includes(normalized as LanguageCode) ? (normalized as LanguageCode) : null;
}

function i18nSupportedLanguagesFromEnv(): LanguageCode[] {
  const raw = (import.meta.env.VITE_I18N_SUPPORTED_LANGS as string | undefined)?.trim();
  if (!raw) return ['en', 'ko'];

  const parsed = raw
    .split(',')
    .map((item) => normalizeLanguageCode(item))
    .filter((item): item is LanguageCode => item !== null);

  const deduped = [...new Set(parsed)];
  return deduped.length > 0 ? deduped : ['en', 'ko'];
}

function i18nDefaultLanguageFromEnv(supported: LanguageCode[]): LanguageCode {
  const fromEnv = normalizeLanguageCode(import.meta.env.VITE_I18N_DEFAULT_LANG as string | undefined);
  if (fromEnv && supported.includes(fromEnv)) return fromEnv;
  return 'en';
}

const i18nSupportedLanguages = i18nSupportedLanguagesFromEnv();

export const env = {
  siteName: (import.meta.env.VITE_SITE_NAME as string | undefined)?.trim() || 'Blen',
  i18nSupportedLanguages,
  i18nDefaultLanguage: i18nDefaultLanguageFromEnv(i18nSupportedLanguages),
};
