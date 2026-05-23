import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  Globe,
  Heart,
  Lightbulb,
  Mail,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageMeta } from '@/components/seo/PageMeta';
import { buildSupportMailto } from '@/lib/buildSupportMailto';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = [Heart, Lightbulb, CreditCard, Shield] as const;

const CATEGORY_ICON_STYLES = [
  { iconBg: 'bg-[#fff1f2] border-[#ffccd3]', iconColor: 'text-rose-600' },
  { iconBg: 'bg-[#eff6ff] border-[#bedbff]', iconColor: 'text-blue-600' },
  { iconBg: 'bg-[#faf5ff] border-[#e9d4ff]', iconColor: 'text-purple-600' },
  { iconBg: 'bg-[#f0fdf4] border-[#b9f8cf]', iconColor: 'text-green-600' },
] as const;

type FaqItem = { question: string; answer: string };
type CategoryCard = { title: string; description: string };
type HelpTopic = { title: string; description: string; cta: string };

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex w-full flex-col gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="w-full">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between rounded-full bg-white px-4 py-3 text-left"
              aria-expanded={isOpen}
            >
              <span className="pr-4 text-base font-medium text-[#030213]">{item.question}</span>
              <ChevronDown
                className={cn(
                  'size-5 shrink-0 text-[#717182] transition-transform',
                  isOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            {isOpen && (
              <p className="px-4 pb-2 pt-3 text-base leading-6 text-[#555]">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SupportPage() {
  const { t } = useTranslation();

  const categories = t('supportPage.categories', { returnObjects: true }) as CategoryCard[];
  const faqItems = t('supportPage.faq.items', { returnObjects: true }) as FaqItem[];
  const helpTopics = t('supportPage.helpTopics', { returnObjects: true }) as HelpTopic[];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    window.location.href = buildSupportMailto({
      to: t('supportPage.emailSupport.email'),
      name,
      email,
      subject,
      message,
    });
  }

  return (
    <>
      <PageMeta
        title={t('supportPage.meta.title')}
        description={t('supportPage.meta.description')}
      />

      <div className="flex min-h-dvh flex-col bg-white">
        <section
          className="px-4 py-12 md:px-8 md:py-16 lg:px-[72px] xl:px-[144px]"
          style={{
            backgroundImage:
              'linear-gradient(168.52deg, rgb(247, 208, 70) 0%, rgba(247, 208, 70, 0.8) 100%)',
          }}
        >
          <div className="mx-auto max-w-[1280px] text-center md:text-left">
            <h1 className="font-rationell text-4xl font-bold leading-tight text-[#1a1a1a] md:text-5xl md:leading-[56px]">
              {t('supportPage.hero.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[rgba(3,2,19,0.8)] md:text-xl md:leading-8">
              {t('supportPage.hero.subtitle')}
            </p>
          </div>
        </section>

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-12 md:px-8 lg:py-16">
          <section className="mb-16 md:mb-24">
            <h2 className="font-rationell text-2xl font-bold text-[#030213]">
              {t('supportPage.browseByCategory')}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {categories.map((card, i) => {
                const Icon = CATEGORY_ICONS[i];
                const styles = CATEGORY_ICON_STYLES[i];
                return (
                  <button
                    key={card.title}
                    type="button"
                    className="rounded-2xl border border-black/10 bg-white p-6 text-left transition-shadow hover:shadow-md"
                  >
                    <div
                      className={cn(
                        'mb-3 flex size-[50px] items-center justify-center rounded-[14px] border',
                        styles.iconBg,
                      )}
                    >
                      <Icon className={cn('size-6', styles.iconColor)} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-medium text-[#030213]">{card.title}</h3>
                    <p className="mt-1 text-sm font-medium text-[#717182]">{card.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-16 md:mb-24">
            <h2 className="font-rationell text-2xl font-bold text-[#030213]">
              {t('supportPage.getInTouch')}
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div
                className="rounded-2xl p-8"
                style={{
                  backgroundImage:
                    'linear-gradient(158.5deg, rgb(3, 2, 19) 0%, rgba(3, 2, 19, 0.9) 100%)',
                }}
              >
                <div className="flex size-12 items-center justify-center rounded-[14px] bg-[#f7d046]">
                  <Mail className="size-6 text-[#030213]" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-white">
                  {t('supportPage.emailSupport.title')}
                </h3>
                <p className="mt-2 text-base leading-6 text-white/80">
                  {t('supportPage.emailSupport.description')}
                </p>
                <a
                  href={`mailto:${t('supportPage.emailSupport.email')}`}
                  className="mt-6 inline-flex items-center gap-2 text-base font-medium text-[#f7d046]"
                >
                  {t('supportPage.emailSupport.email')}
                  <ArrowRight className="size-4" />
                </a>
              </div>

              <div
                className="rounded-2xl p-8"
                style={{
                  backgroundImage:
                    'linear-gradient(158.5deg, rgb(247, 208, 70) 0%, rgba(247, 208, 70, 0.8) 100%)',
                }}
              >
                <div className="flex size-12 items-center justify-center rounded-[14px] bg-white">
                  <MessageCircle className="size-6 text-[#030213]" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-[#030213]">
                  {t('supportPage.liveChat.title')}
                </h3>
                <p className="mt-2 text-base leading-6 text-[rgba(3,2,19,0.8)]">
                  {t('supportPage.liveChat.description')}
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-[#030213] px-6 py-3 text-base font-medium text-white"
                >
                  <MessageCircle className="size-4" />
                  {t('supportPage.liveChat.startChat')}
                </button>
              </div>
            </div>
          </section>

          <section className="mb-16 md:mb-24">
            <div className="text-center">
              <h2 className="font-rationell text-2xl font-bold text-[#030213]">
                {t('supportPage.faq.title')}
              </h2>
              <p className="mt-3 text-base text-[#717182]">{t('supportPage.faq.subtitle')}</p>
            </div>
            <div className="mt-10">
              <FaqAccordion items={faqItems} />
            </div>
          </section>

          <section className="mb-16 grid gap-6 md:grid-cols-3 md:mb-24">
            {helpTopics.map((topic, index) => (
              <div
                key={topic.title}
                className="rounded-2xl bg-[rgba(236,236,240,0.3)] px-6 py-6"
              >
                <h3 className="text-lg font-medium text-[#030213]">{topic.title}</h3>
                <p className="mt-2 text-sm leading-5 text-[#717182]">{topic.description}</p>
                <button
                  type="button"
                  className={cn(
                    'mt-4 text-sm font-medium',
                    index === 2 ? 'text-[#d4183d]' : 'text-[#030213]',
                  )}
                >
                  {topic.cta}
                </button>
              </div>
            ))}
          </section>

          <section id="contact-form" className="mb-16 scroll-mt-28 md:mb-24">
            <div className="text-center">
              <h2 className="font-rationell text-2xl font-bold text-[#030213]">
                {t('supportPage.form.title')}
              </h2>
              <p className="mt-3 text-base text-[#717182]">{t('supportPage.form.subtitle')}</p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 max-w-2xl rounded-2xl bg-[rgba(236,236,240,0.2)] p-6 md:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#030213]">
                    {t('supportPage.form.nameLabel')}
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t('supportPage.form.namePlaceholder')}
                    className="h-[50px] rounded-[14px] border border-black/10 bg-white px-4 text-base placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-2 focus:ring-[#030213]/20"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#030213]">
                    {t('supportPage.form.emailLabel')}
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t('supportPage.form.emailPlaceholder')}
                    className="h-[50px] rounded-[14px] border border-black/10 bg-white px-4 text-base placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-2 focus:ring-[#030213]/20"
                  />
                </label>
              </div>
              <label className="mt-5 flex flex-col gap-2">
                <span className="text-sm font-medium text-[#030213]">
                  {t('supportPage.form.subjectLabel')}
                </span>
                <input
                  type="text"
                  name="subject"
                  placeholder={t('supportPage.form.subjectPlaceholder')}
                  className="h-[50px] rounded-[14px] border border-black/10 bg-white px-4 text-base placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-2 focus:ring-[#030213]/20"
                />
              </label>
              <label className="mt-5 flex flex-col gap-2">
                <span className="text-sm font-medium text-[#030213]">
                  {t('supportPage.form.messageLabel')}
                </span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder={t('supportPage.form.messagePlaceholder')}
                  className="resize-none rounded-[14px] border border-black/10 bg-white px-4 py-3 text-base placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none focus:ring-2 focus:ring-[#030213]/20"
                />
              </label>
              <button
                type="submit"
                className="mt-5 h-14 w-full rounded-[14px] bg-[#030213] text-base font-medium text-white transition-opacity hover:opacity-90"
              >
                {t('supportPage.form.submit')}
              </button>
            </form>
          </section>

          <section
            className="rounded-2xl px-6 py-10 text-center md:px-10"
            style={{
              backgroundImage:
                'linear-gradient(170.7deg, rgba(247, 208, 70, 0.2) 0%, rgba(247, 208, 70, 0.1) 100%)',
            }}
          >
            <h2 className="font-rationell text-2xl font-bold text-[#030213]">
              {t('supportPage.community.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-[#717182]">
              {t('supportPage.community.description')}
            </p>
            <Link
              to="https://www.instagram.com/blen.ai_matching"
              target="_blank"
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-[#030213] px-6 py-3 text-base font-medium text-white"
            >
              <Globe className="size-5" />
              {t('supportPage.community.cta')}
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
