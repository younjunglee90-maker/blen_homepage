import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to a home section when landing on `/#features`, `/#download`, etc. */
export function useHomeHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || !hash) return;

    const id = hash.replace('#', '');
    if (!id) return;

    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const timer = window.setTimeout(scroll, 100);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
}
