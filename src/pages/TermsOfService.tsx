import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/components/seo/PageMeta';
import { SITE_PATHS } from '@/lib/siteNav';
import { cn } from '@/lib/utils';


import { TERMS_SECTION_IDS, type TermsSectionId } from '@/pages/termsSections';

type TermsSectionContent = {
  title: string;
  paragraphs?: string[];
  intro?: string;
  leadIn?: string;
  bullets?: string[];
  callout?: { title: string; description: string; variant?: 'yellow' | 'amber' };
  privacyPolicyPrefix?: string;
  privacyPolicyLink?: string;
  privacyPolicySuffix?: string;
  emailLabel?: string;
  email?: string;
  supportLabel?: string;
  supportLinkText?: string;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function TermsSidebar({
  activeId,
  onNavigate,
  className,
  sectionIds,
  getTitle,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
  sectionIds: readonly TermsSectionId[];
  getTitle: (id: TermsSectionId) => string;
}) {
  const { t } = useTranslation();

  return (
    <aside className={cn('lg:sticky lg:top-24 lg:self-start', className)}>
      <p className="mb-4 text-sm font-medium text-[#030213]">{t('common.contents')}</p>
      <nav className="flex flex-col gap-1">
        {sectionIds.map((id) => {
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
  sectionIds,
  getTitle,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
  sectionIds: readonly TermsSectionId[];
  getTitle: (id: TermsSectionId) => string;
}) {
  const { t } = useTranslation();

  return (
    <div className="lg:hidden">
      <label htmlFor="terms-section-jump" className="mb-2 block text-sm font-medium text-[#030213]">
        {t('common.jumpToSection')}
      </label>
      <div className="relative">
        <select
          id="terms-section-jump"
          value={activeId}
          onChange={(e) => onNavigate(e.target.value)}
          className="w-full appearance-none rounded-[10px] border border-black/10 bg-[#fdf6da] px-4 py-3 pr-10 text-sm font-medium text-[#030213]"
        >
          {sectionIds.map((id) => (
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

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-rationell text-2xl leading-tight font-bold text-[#030213] md:text-[32px] md:leading-[48px]">
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
        <li key={item} className="text-base flex items-center leading-6 text-[#717182]">
         <span className="text-3xl leading-6 text-[#717182] mr-2">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function CalloutBox({
  title,
  description,
  variant = 'yellow',
}: {
  title: string;
  description: string;
  variant?: 'yellow' | 'amber';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6',
        variant === 'yellow'
          ? 'border-[rgba(247,208,70,0.2)] bg-[rgba(247,208,70,0.1)]'
          : 'border-[#fee685] bg-[#fffbeb]',
      )}
    >
      <p
        className={cn(
          'text-base font-semibold',
          variant === 'amber' ? 'text-[#7b3306]' : 'text-[#030213]',
        )}
      >
        {title}
      </p>
      <p
        className={cn(
          'mt-2 text-sm leading-5',
          variant === 'amber' ? 'text-[#973c00]' : 'text-[#717182]',
        )}
      >
        {description}
      </p>
    </div>
  );
}

function TermsSectionBlock({ id, content }: { id: TermsSectionId; content: TermsSectionContent }) {
  const isContact = id === 'contact';

  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      {isContact ? (
        <h2 className="text-2xl font-medium leading-8 text-[#030213]">{content.title}</h2>
      ) : (
        <SectionHeading>{content.title}</SectionHeading>
      )}

      {content.intro && id === 'user-responsibilities' ? (
        <p className="text-xl font-semibold leading-8 text-[#717182]">{content.intro}</p>
      ) : null}

      {content.callout ? (
        <CalloutBox
          title={content.callout.title}
          description={content.callout.description}
          variant={content.callout.variant}
        />
      ) : null}

      {content.leadIn ? <BodyText>{content.leadIn}</BodyText> : null}

      {content.paragraphs && content.bullets && content.paragraphs.length > 1 ? (
        <>
          <BodyText>{content.paragraphs[0]}</BodyText>
          <BulletList items={content.bullets} />
          {content.paragraphs.slice(1).map((paragraph) => (
            <BodyText key={paragraph}>{paragraph}</BodyText>
          ))}
        </>
      ) : (
        <>
          {content.paragraphs?.map((paragraph) => (
            <BodyText key={paragraph}>{paragraph}</BodyText>
          ))}
          {content.bullets ? <BulletList items={content.bullets} /> : null}
        </>
      )}

      {content.privacyPolicyPrefix ? (
        <p className="text-base leading-6 text-[#717182]">
          {content.privacyPolicyPrefix}
          <Link to={SITE_PATHS.privacy} className="text-[#030213] underline">
            {content.privacyPolicyLink}
          </Link>
          {content.privacyPolicySuffix}
        </p>
      ) : null}

      {isContact && content.intro ? (
        <div className="rounded-2xl bg-[rgba(236,236,240,0.5)] p-6">
          <BodyText>{content.intro}</BodyText>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium text-[#030213]">{content.emailLabel}</span>
              <span className="text-[#717182]"> {content.email}</span>
            </p>
            <p>
              <span className="font-medium text-[#030213]">{content.supportLabel}</span>{' '}
              <Link to={SITE_PATHS.support} className="text-[#717182] underline">
                {content.supportLinkText}
              </Link>
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function TermsOfServicePage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<TermsSectionId>(TERMS_SECTION_IDS[0]);

  const getSectionTitle = useCallback(
    (id: TermsSectionId) => t(`termsPage.sections.${id}.title`),
    [t],
  );

  const getSectionContent = useCallback(
    (id: TermsSectionId) =>
      t(`termsPage.sections.${id}`, { returnObjects: true }) as TermsSectionContent,
    [t],
  );

  const handleNavigate = useCallback((id: string) => {
    setActiveSection(id as TermsSectionId);
    scrollToSection(id);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    TERMS_SECTION_IDS.forEach((id) => {
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

  return (
    <>
      <PageMeta
        title={t('termsPage.meta.title')}
        description={t('termsPage.meta.description')}
      />

      <div className="bg-white">
        <section className="bg-gradient-to-b from-[rgba(247,208,70,0.1)] to-white px-4 pb-12 pt-10 md:px-8 md:pt-14 lg:px-[72px] lg:pb-12 lg:pt-16 xl:px-[144px]">
          <div className="mx-auto max-w-[1280px] p-6">
            <h1 className="font-rationell text-3xl leading-tight font-bold text-[#1a1a1a] md:text-5xl md:leading-[56px]">
              {t('termsPage.hero.title')}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-7 text-[#717182]">
              {t('termsPage.hero.subtitle')}
            </p>
            <p className="mt-4 text-sm leading-5 text-[#717182]">{t('common.lastUpdated')}</p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 md:px-8 lg:px-8">
          <MobileSectionSelect
            activeId={activeSection}
            onNavigate={handleNavigate}
            sectionIds={TERMS_SECTION_IDS}
            getTitle={getSectionTitle}
          />

          <div className="mt-8 flex flex-col gap-12 lg:mt-12 lg:flex-row lg:gap-12">
            <TermsSidebar
              activeId={activeSection}
              onNavigate={handleNavigate}
              className="hidden w-64 shrink-0 lg:block"
              sectionIds={TERMS_SECTION_IDS}
              getTitle={getSectionTitle}
            />

            <article className="min-w-0 flex-1 space-y-16">
              {TERMS_SECTION_IDS.map((id) => (
                <TermsSectionBlock key={id} id={id} content={getSectionContent(id)} />
              ))}
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
