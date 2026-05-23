import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/components/seo/PageMeta';
import { useHomeHashScroll } from '@/hooks/useHomeHashScroll';

import BlendHero from './BlendHero';
import BlendAbout from './BlendAbout';
import FeaturesSection from './FeaturesSection';
import DownloadSection from './DownloadSection';

export default function Home() {
  const { t } = useTranslation();
  useHomeHashScroll();

  return (
    <>
      <PageMeta
        title={t('meta.homeTitle')}
        description={t('meta.homeDescription')}
        keywords={t('meta.homeKeywords')}
      />
      <div className="bg-background">
        <BlendHero />
        <BlendAbout />
        <FeaturesSection />
        <DownloadSection />
      </div>
    </>
  );
}
