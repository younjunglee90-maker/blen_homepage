import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  BarChart3,
  Brain,
  ChevronDown,
  // ChevronRight,
  Eye,
  Lock,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/components/seo/PageMeta';
import { cn } from '@/lib/utils';

import shieldIcon from '@/assets/images/privacy-shield-icon.svg';
import { PRIVACY_SECTION_IDS, type PrivacySectionId } from '@/pages/privacySections';

const FEATURE_ICONS = [Lock, Eye, Shield] as const;
const DATA_COLLECTION_ICONS = [User, BarChart3, Brain] as const;

const LARGE_HEADING_IDS: PrivacySectionId[] = [
  'privacy-controls',
  'cookies',
  // 'third-party',
  'data-retention',
  'your-rights',
  'contact',
];

type FeatureHighlight = { title: string; description: string };
type PrivacyControlCard = { title: string; description: string };
// type SecurityItem = { title: string; description: string };
type CookieType = { label: string; description: string };
type RightItem = { label: string; text: string };

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionHeading({ children, large }: { children: ReactNode; large?: boolean }) {
  return (
    <h2
      className={cn(
        'font-rationell font-bold text-[#030213]',
        large ? 'text-2xl leading-tight md:text-[32px] md:leading-[48px]' : 'text-2xl leading-8',
      )}
    >
      {children}
    </h2>
  );
}

function BodyText({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-base leading-6 text-[#717182]', className)}>{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="text-base leading-6 text-[#717182]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function PrivacySidebar({
  activeId,
  onNavigate,
  className,
  getTitle,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
  getTitle: (id: PrivacySectionId) => string;
}) {
  const { t } = useTranslation();

  return (
    <aside className={cn('lg:sticky lg:top-24 lg:self-start', className)}>
      <p className="mb-4 text-sm font-medium text-[#030213]">{t('common.contents')}</p>
      <nav className="flex flex-col gap-1">
        {PRIVACY_SECTION_IDS.map((id: PrivacySectionId) => {
          const isActive = activeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#fdf6da] text-[#030213]'
                  : 'text-[#717182] hover:bg-[#fdf6da]/50',
              )}
            >
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  isActive ? 'bg-[#030213]' : 'bg-[#717182]/40',
                )}
                aria-hidden
              />
              {getTitle(id)}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileSectionSelect({
  activeId,
  onNavigate,
  getTitle,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
  getTitle: (id: PrivacySectionId) => string;
}) {
  const { t } = useTranslation();

  return (
    <div className="lg:hidden">
      <label htmlFor="privacy-section-jump" className="mb-2 block text-sm font-medium text-[#030213]">
        {t('common.jumpToSection')}
      </label>
      <div className="relative">
        <select
          id="privacy-section-jump"
          value={activeId}
          onChange={(e) => onNavigate(e.target.value)}
          className="w-full appearance-none rounded-[10px] border border-black/10 bg-[#fdf6da] px-4 py-3 pr-10 text-sm font-medium text-[#030213]"
        >
          {PRIVACY_SECTION_IDS.map((id: PrivacySectionId) => (
            <option key={id} value={id}>
              {getTitle(id)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#1a1a1a]"
          aria-hidden
        />
      </div>
    </div>
  );
}

function FeatureBar({ highlights }: { highlights: FeatureHighlight[] }) {
  return (
    <section className="border-y mx-auto  max-w-[1280px] border-black/10 mt-0 lg:mt-8 bg-[rgba(236,236,240,0.3)] px-4 py-6 md:px-8 lg:px-[72px] xl:px-[144px]">
      <div className="mx-auto grid  gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(({ title, description }, index) => {
          const Icon = FEATURE_ICONS[index] as LucideIcon;
          return (
            <div key={title} className="flex items-center gap-3">
              <div className="flex  size-10 shrink-0 items-center justify-center rounded-[14px] bg-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]">
                <Icon className="size-5 text-[#030213]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-lg font-medium leading-7 text-[#030213]">{title}</p>
                <p className="text-xs leading-4 text-[#717182]">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PrivacySectionBlock({ id }: { id: PrivacySectionId }) {
  const { t} = useTranslation();
  const isLarge = LARGE_HEADING_IDS.includes(id);


  switch (id) {
    case 'overview': {
      const paragraphs = t('privacyPage.sections.overview.paragraphs', {
        returnObjects: true,
      }) as string[];
      return (
        <section id={id} className="scroll-mt-28 space-y-4">
          <SectionHeading>{t('privacyPage.sections.overview.title')}</SectionHeading>
          {paragraphs.map((paragraph) => (
            <BodyText key={paragraph}>{paragraph}</BodyText>
          ))}
        </section>
      );
    }

    case 'data-collection': {
      const paragraphs = t('privacyPage.sections.data-collection.paragraphs', {
        returnObjects: true,
      }) as string[];
      const labels = t('privacyPage.sections.data-collection.dataCollectionLabels', {
        returnObjects: true,
      }) as string[];
      return (
        <section id={id} className="scroll-mt-28 space-y-5">
          <SectionHeading>{t('privacyPage.sections.data-collection.title')}</SectionHeading>
          {paragraphs.map((paragraph) => (
            <BodyText key={paragraph}>{paragraph}</BodyText>
          ))}
          <div className="flex flex-col gap-3">
            {labels.map((label, index) => {
              const Icon = DATA_COLLECTION_ICONS[index] as LucideIcon;
              return (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-[14px] border border-black/10 bg-white p-4 text-left transition-colors hover:bg-[#fafafa]"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-5 text-[#030213]" strokeWidth={1.75} />
                    <span className="text-base font-medium text-[#030213]">{label}</span>
                  </span>
                  {/* <ChevronRight className="size-5 text-[#717182]" aria-hidden /> */}
                </button>
              );
            })}
          </div>
        </section>
      );
    }

    case 'ai-processing': {
      const callout = t('privacyPage.sections.ai-processing.callout', {
        returnObjects: true,
      }) as { title: string; description: string };
      const paragraphs = t('privacyPage.sections.ai-processing.paragraphs', {
        returnObjects: true,
      }) as string[];
      const bullets = t('privacyPage.sections.ai-processing.bullets', {
        returnObjects: true,
      }) as string[];
      return (
        <section id={id} className="scroll-mt-28 space-y-4">
          <SectionHeading>{t('privacyPage.sections.ai-processing.title')}</SectionHeading>
          <div className="rounded-2xl border border-[#bedbff] bg-[#eff6ff] p-6">
            <p className="text-sm font-medium text-[#1c398e]">{callout.title}</p>
            <p className="mt-2 text-sm leading-5 text-[#193cb8]">{callout.description}</p>
          </div>
          {paragraphs.map((paragraph) => (
            <BodyText key={paragraph}>{paragraph}</BodyText>
          ))}
          <BulletList items={bullets} />
        </section>
      );
    }

    case 'privacy-controls': {
      const cards = t('privacyPage.sections.privacy-controls.privacyControlCards', {
        returnObjects: true,
      }) as PrivacyControlCard[];
      return (
        <section id={id} className="scroll-mt-28 space-y-6 py-2">
          <SectionHeading large={isLarge}>
            {t('privacyPage.sections.privacy-controls.heading')}
          </SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[14px] border border-black/10 bg-white p-5 sm:p-6"
              >
                <Shield className="mb-2.5 size-6 text-[#030213]" strokeWidth={1.75} />
                <h3 className="text-xl font-medium text-[#030213]">{card.title}</h3>
                <p className="mt-2 text-base leading-6 text-[#717182]">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'cookies': {
      const paragraphs = t('privacyPage.sections.cookies.paragraphs', {
        returnObjects: true,
      }) as string[];
      const types = t('privacyPage.sections.cookies.types', { returnObjects: true }) as {
        essential: CookieType;
        analytics: CookieType;
        preference: CookieType;
      };
      const cookieTypes = [types.essential, types.analytics, types.preference];
      return (
        <section id={id} className="scroll-mt-28 space-y-4">
          <SectionHeading large={isLarge}>
            {t('privacyPage.sections.cookies.heading')}
          </SectionHeading>
          {paragraphs.map((paragraph) => (
            <BodyText key={paragraph}>{paragraph}</BodyText>
          ))}
          <div className="space-y-3 rounded-[14px] bg-[rgba(236,236,240,0.5)] p-5">
            {cookieTypes.map((cookie) => (
              <p key={cookie.label} className="text-sm leading-5">
                <span className="font-medium text-[#030213]">{cookie.label}</span>
                <span className="text-[#717182]"> {cookie.description}</span>
              </p>
            ))}
          </div>
        </section>
      );
    }

    // case 'security': {
    //   const paragraphs = t('privacyPage.sections.security.paragraphs', {
    //     returnObjects: true,
    //   }) as string[];
    //   const items = t('privacyPage.sections.security.securityItems', {
    //     returnObjects: true,
    //   }) as SecurityItem[];
    //   return (
    //     <section id={id} className="scroll-mt-28 space-y-5">
    //       <SectionHeading>{t('privacyPage.sections.security.title')}</SectionHeading>
    //       {paragraphs.map((paragraph) => (
    //         <BodyText key={paragraph}>{paragraph}</BodyText>
    //       ))}
    //       <div className="flex flex-col gap-4">
    //         {items.map((item) => (
    //           <div key={item.title} className="flex gap-4">
    //             <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f7d046]">
    //               <Shield className="size-4 text-[#030213]" strokeWidth={2} />
    //             </div>
    //             <div>
    //               <h3 className="text-lg font-medium text-[#030213]">{item.title}</h3>
    //               <p className="text-sm leading-5 text-[#717182]">{item.description}</p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //   );
    // }

    // case 'third-party': {
    //   const paragraphs = t('privacyPage.sections.third-party.paragraphs', {
    //     returnObjects: true,
    //   }) as string[];
    //   const bullets = t('privacyPage.sections.third-party.bullets', {
    //     returnObjects: true,
    //   }) as string[];
    //   return (
    //     <section id={id} className="scroll-mt-28 space-y-4">
    //       <SectionHeading large={isLarge}>
    //         {t('privacyPage.sections.third-party.heading')}
    //       </SectionHeading>
    //       {paragraphs.map((paragraph) => (
    //         <BodyText key={paragraph}>{paragraph}</BodyText>
    //       ))}
    //       <BulletList items={bullets} />
    //     </section>
    //   );
    // }

    case 'data-retention': {
      const bullets = t('privacyPage.sections.data-retention.bullets', {
        returnObjects: true,
      }) as string[];
      return (
        <section id={id} className="scroll-mt-28 space-y-4">
          <SectionHeading large={isLarge}>
            {t('privacyPage.sections.data-retention.heading')}
          </SectionHeading>
          <p className="text-base font-semibold leading-6 text-[#717182]">
            {t('privacyPage.sections.data-retention.intro')}
          </p>
          <BulletList items={bullets} />
        </section>
      );
    }

    case 'your-rights': {
      const callout = t('privacyPage.sections.your-rights.callout', {
        returnObjects: true,
      }) as { title: string; description: string };
      const rights = t('privacyPage.sections.your-rights.rights', {
        returnObjects: true,
      }) as RightItem[];
      return (
        <section id={id} className="scroll-mt-28 space-y-4">
          <SectionHeading large={isLarge}>
            {t('privacyPage.sections.your-rights.heading')}
          </SectionHeading>
          <div className="rounded-2xl border border-[rgba(247,208,70,0.2)] bg-[rgba(247,208,70,0.1)] p-6">
            <p className="text-base font-semibold text-[#030213]">{callout.title}</p>
            <p className="mt-2 text-base leading-6 text-[#717182]">{callout.description}</p>
          </div>
          <p className="text-base font-semibold leading-6 text-[#717182]">
            {t('privacyPage.sections.your-rights.intro')}
          </p>
          <ul className="flex flex-col gap-3">
            {rights.map((right) => (
              <li key={right.label} className="text-base leading-6">
                <span className="font-medium text-[#030213]">{right.label}</span>
                <span className="text-[#717182]">{right.text}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'contact': {
      const supportLink = t('privacyPage.sections.contact.supportCenterLink');
      return (
        <section id={id} className="scroll-mt-28 space-y-4">
          <SectionHeading large={isLarge}>
            {t('privacyPage.sections.contact.heading')}
          </SectionHeading>
          <div className="rounded-2xl bg-[#030213] p-6 text-white">
            <p className="text-base leading-6">{t('privacyPage.sections.contact.intro')}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">{t('privacyPage.sections.contact.privacyTeamLabel')}</span>
                <span className="text-white/90">
                  {' '}
                  {t('privacyPage.sections.contact.privacyTeamEmail')}
                </span>
              </p>
              <p>
                <span className="font-medium">{t('privacyPage.sections.contact.dpoLabel')}</span>
                <span className="text-white/90"> {t('privacyPage.sections.contact.dpoEmail')}</span>
              </p>
              <p>
                <span className="font-medium">
                  {t('privacyPage.sections.contact.supportCenterLabel')}
                </span>{' '}
                <a href={`https://${supportLink}`} className="text-[#f7d046] underline">
                  {supportLink}
                </a>
              </p>
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<PrivacySectionId>(PRIVACY_SECTION_IDS[0]);

  const featureHighlights = t('privacyPage.featureHighlights', {
    returnObjects: true,
  }) as FeatureHighlight[];

  const getSectionTitle = useCallback(
    (id: PrivacySectionId) => t(`privacyPage.sections.${id}.title`),
    [t],
  );

  const handleNavigate = useCallback((id: string) => {
    setActiveSection(id as PrivacySectionId);
    scrollToSection(id);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    PRIVACY_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-20% 0px -55% 0px', threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

  
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const {i18n} = useTranslation();
  return (
    <>
      <PageMeta
        title={t('privacyPage.meta.title')}
        description={t('privacyPage.meta.description')}
      />

      <section className="bg-gradient-to-b from-[#030213] to-[rgba(3,2,19,0.9)] px-4 pb-12 pt-10 md:px-8 md:pt-14 lg:px-[72px] lg:pb-12 lg:pt-16 xl:px-[144px]">
        <div className="mx-auto max-w-[1280px] space-y-6 p-6">
          <div className="flex flex-row items-center gap-4 sm:flex-row sm:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f7d046]">
              <img src={shieldIcon} alt="" className="size-6" />
            </div>
            <h1 className={`font-rationell  ${i18n.language != 'ko' ? 'text-3xl': 'text-2xl'} font-bold leading-tight text-[#f6f6f6] md:text-5xl md:leading-[56px]`}>
              {t('privacyPage.hero.title')}
            </h1>
          </div>
          <p className="max-w-3xl text-lg leading-7 text-white/80">
            {t('privacyPage.hero.subtitle')}
          </p>
          <p className="text-sm leading-5 text-white/60">{t('common.lastUpdated')}</p>
        </div>
      </section>

      <FeatureBar highlights={featureHighlights} />

      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8 lg:py-12">
        <MobileSectionSelect
          activeId={activeSection}
          onNavigate={handleNavigate}
          getTitle={getSectionTitle}
        />

        <div className="mt-8 flex flex-col gap-12 lg:mt-12 lg:flex-row lg:gap-6">
          <PrivacySidebar
            activeId={activeSection}
            onNavigate={handleNavigate}
            className="hidden w-64 shrink-0 lg:block"
            getTitle={getSectionTitle}
          />

          <article className="min-w-0 flex-1 space-y-16">
            {PRIVACY_SECTION_IDS.map((id) => (
              <PrivacySectionBlock key={id} id={id} />
            ))}
          </article>
        </div>
      </div>
    </>
  );
}
