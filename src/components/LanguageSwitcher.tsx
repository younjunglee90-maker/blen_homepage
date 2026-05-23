import { useTranslation } from 'react-i18next';

import { env } from '@/config/env';
import { languageRegistry } from '@/i18n';

import { Globe } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const active = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#0000000A] bg-[#0000000A] px-3 py-2">
      <Globe className="h-5 w-5 text-[#1A1A1A]" />

      <Select
        value={active}
        onValueChange={(value) => {
          void i18n.changeLanguage(value);
        }}
      >
        <SelectTrigger className="h-auto w-auto border-0 bg-transparent px-0 py-0 pr-2 shadow-none focus:ring-0">
          <SelectValue placeholder={t('common.language')} />
        </SelectTrigger>

        <SelectContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="-translate-x-10 rounded-xl border border-[#0000000A] bg-[#F4D96B]"
        >
          {env.i18nSupportedLanguages.map((code) => {
            const language = languageRegistry[code];

            return (
              <SelectItem key={language.code} value={language.code}>
                {language.nativeLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
