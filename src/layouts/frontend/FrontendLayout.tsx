import { Outlet } from 'react-router-dom';

import { FrontendFooter } from '@/components/partials/frontend/FrontendFooter';
import { FrontendHeader } from '@/components/partials/frontend/FrontendHeader';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export function FrontendLayout() {
  useScrollToTop();

  return (
    <div className="min-h-dvh bg-background">
      <FrontendHeader />
      <main className="mx-auto w-full">
        <Outlet />
      </main>
      <FrontendFooter />
    </div>
  );
}
