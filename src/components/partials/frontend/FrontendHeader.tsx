import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { homeSectionHref, SITE_PATHS } from '@/lib/siteNav';
import { cn } from '@/lib/utils';

const HOME_SCROLL_SECTIONS = ['hero', 'features', 'download'] as const;
type HomeScrollSection = (typeof HOME_SCROLL_SECTIONS)[number];

const PAGE_LINKS = [
  // { labelKey: 'terms' as const, path: SITE_PATHS.terms },
  // { labelKey: 'privacy' as const, path: SITE_PATHS.privacy },
  { labelKey: 'support' as const, path: SITE_PATHS.support },
];

export function FrontendHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeScrollSection | ''>('');

  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }

    const observers: IntersectionObserver[] = [];

    HOME_SCROLL_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isHome]);

  function scrollToSection(id: HomeScrollSection) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  }

  function goToHomeSection(section: HomeScrollSection) {
    setIsMobileMenuOpen(false);
    if (isHome) {
      scrollToSection(section);
      return;
    }
    navigate(homeSectionHref(section));
  }

  function navItemClass(isActive: boolean) {
    return cn(
      'rounded-full px-3 py-1.5 text-base font-medium transition-colors duration-200',
      isActive
        ? 'bg-black text-white'
        : 'text-[#364153] hover:bg-black hover:text-white',
    );
  }

  function navScrollClass(id: HomeScrollSection) {
    return cn(navItemClass(isHome && activeSection === id), 'cursor-pointer');
  }

  function navLinkClass(path: string) {
    return navItemClass(pathname === path);
  }

  return (
    <header className="sticky top-0 z-40 bg-primary">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="font-semibold tracking-tight"
          onClick={() => isHome && scrollToSection('hero')}
        >
          <img src="/logo.png" alt={t('common.appName')} />
        </Link>

        <nav className="hidden items-center gap-1 font-medium md:flex lg:gap-2">
          <button type="button" onClick={() => goToHomeSection('hero')} className={navScrollClass('hero')}>
            {t('menu.home')}
          </button>
          <button
            type="button"
            onClick={() => goToHomeSection('features')}
            className={navScrollClass('features')}
          >
            {t('menu.features')}
          </button>
          <button
            type="button"
            onClick={() => goToHomeSection('download')}
            className={navScrollClass('download')}
          >
            {t('menu.download')}
          </button>
          {PAGE_LINKS.map((item) => (
            <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
              {t(`menu.${item.labelKey}`)}
            </Link>
          ))}
         
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="rounded-lg p-2 transition-colors hover:bg-[#FFC702] md:hidden"
            aria-label={t('common.toggleMenu')}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-[#1A1A1A]" />
            ) : (
              <Menu className="h-5 w-5 text-[#1A1A1A]" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed top-0 right-0 z-50 flex h-full w-1/2 max-w-[50vw] flex-col bg-[#FFD95A] shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-[#F5C842] bg-gradient-to-r from-[#FFD95A] to-[#FFC702] p-4">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30"
                aria-label={t('common.closeMenu')}
              >
                <X className="h-5 w-5 text-[#1A1A1A]" />
              </button>
            </div>
            <nav className="flex flex-col gap-3 px-4 pt-4">
              <button
                type="button"
                onClick={() => goToHomeSection('hero')}
                className={navScrollClass('hero') + ' text-left'}
              >
                {t('menu.home')}
              </button>
              
              <button
                type="button"
                onClick={() => goToHomeSection('features')}
                className={navScrollClass('features') + ' text-left'}
              >
                {t('menu.features')}
              </button>
              
              <button
                type="button"
                onClick={() => goToHomeSection('download')}
                className={navScrollClass('download') + ' text-left'}
              >
                {t('menu.download')}
              </button>
              {PAGE_LINKS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={navLinkClass(item.path) + ' text-left'}
                >
                  {t(`menu.${item.labelKey}`)}
                </Link>
              ))}
             
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
