import Section from '@/components/Section';
import { useTranslation } from 'react-i18next';

export default function DownloadSection() {
  const { t } = useTranslation();
  return (
    <Section
      id="download"
      className="font-inter relative flex w-full items-center justify-center overflow-hidden py-12 lg:py-24"
    >
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-download.jpg"
          alt="Couple holding hands"
          className="h-full w-full object-cover object-center"
        />
        {/* Overlay to soften the image */}
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* ── Hero Card ── */}
      <div className="relative z-10 container mx-auto w-full sm:mx-8 md:mx-auto">
        <div
          className="flex flex-col items-center gap-0 rounded-3xl px-8 py-12 text-center sm:px-14 sm:py-16"
          style={{ backgroundColor: 'var(--brand-primary-light)' }}
        >
          {/* Badge */}
          <span
            className="mb-6 inline-flex cursor-pointer items-center rounded-full px-5 py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-secondary)' }}
          >
            {t('download.topTitle')}
          </span>

          {/* Heading */}
          <h1 className="mb-3 font-rationell text-[24px] leading-normal font-bold tracking-tight text-[#1A1A1A] lg:text-[48px]">
            {t('download.title')}
          </h1>

          {/* Subheading */}
          <p className="max-w-auto mb-8 text-base lg:text-lg leading-relaxed font-normal text-[#6B6B6B]">
            {t('download.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex w-full flex-col gap-3 pt-5 sm:w-auto sm:flex-row lg:pt-10">
            {/* App Store */}
            <a
              href="#"
              className="font-inter inline-flex cursor-pointer items-center bg-[#121212] text-white justify-center gap-2.5 rounded-full border border-[#121212] px-5.5 py-3 text-base text-[16px] font-medium text-[#121212] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#121212] hover:text-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.2)]"
            >
              <img src="/apple.png" alt="App Store" />
              {t('common.appleStore')}
            </a>

            {/* Google Play */}
            <a
              href="#"
              className="font-inter inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#121212] px-5.5 py-3 text-base text-[16px] font-medium text-[#121212] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#121212] hover:text-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.2)]"
            >
              <img src="/google.png" alt="Google Play" />
              {t('common.googlePlay')}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
