import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { languageDirectionFor } from '@/i18n';

export function useDocumentLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.resolvedLanguage ?? i18n.language;
    document.documentElement.lang = lang;
    document.documentElement.dir = languageDirectionFor(lang);
  }, [i18n, i18n.language, i18n.resolvedLanguage]);
}
