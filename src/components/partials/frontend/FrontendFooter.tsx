import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function FrontendFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#101828]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-[#BCBCBC] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className='flex justify-center lg:justify-start'>
          <Link to="/">
            <img src="/logo-light.png" alt="Logo" className="h-8" />
          </Link>
        </div>
        <div className='flex gap-4 justify-center'>
          <Link to="/terms-of-service" className='hover:text-primary'>{t('menu.terms')}</Link>
          <Link to="/privacy-policy" className='hover:text-primary'>{t('menu.privacy')}</Link>
          <Link to="/contact-us" className='hover:text-primary'>{t('menu.contact')}</Link>
        </div>
        <div className='flex justify-center lg:justify-end'>
          <p className='text-end'>© {new Date().getFullYear()} {t('common.appName')}</p>
        </div>
      </div>
    </footer>
  );
}
