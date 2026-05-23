import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to the top on route changes, except home hash links handled elsewhere. */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (pathname === '/' && hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
}
