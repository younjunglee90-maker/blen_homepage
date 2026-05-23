import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export type PageMetaProps = {
  title: string;
  description?: string;
  keywords?: string | string[];
};

function formatKeywords(keywords: string | string[] | undefined): string | undefined {
  if (keywords === undefined) return undefined;
  if (typeof keywords === 'string') return keywords.trim() || undefined;
  const joined = keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .join(', ');
  return joined || undefined;
}

export function PageMeta({ title, description, keywords }: PageMetaProps) {
  const { t } = useTranslation();
  const siteName = import.meta.env.VITE_SITE_NAME ?? t('common.appName');
  const trimmedTitle = title.trim();
  const documentTitle = trimmedTitle ? `${trimmedTitle} | ${siteName}` : siteName;
  const keywordsContent = formatKeywords(keywords);

  return (
    <Helmet>
      <title>{documentTitle}</title>
      {description !== undefined && description.trim() !== '' ? (
        <meta name="description" content={description.trim()} />
      ) : null}
      {keywordsContent !== undefined ? <meta name="keywords" content={keywordsContent} /> : null}
    </Helmet>
  );
}
