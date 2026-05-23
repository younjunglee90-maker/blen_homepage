import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';

import { FrontendLayout } from '@/layouts/frontend/FrontendLayout';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { HomePage, NotFoundPage, SupportPage, TermsOfServicePage, PrivacyPolicyPage } from '@/routes/lazy-pages';
import Loading from '@/components/Loading';

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <FrontendLayout />,
        children: [
          { path: '/', element: withSuspense(<HomePage />) },
          { path: '/terms-of-service', element: withSuspense(<TermsOfServicePage />) },
          { path: '/privacy-policy', element: withSuspense(<PrivacyPolicyPage />) },
          { path: '/contact-us', element: withSuspense(<SupportPage />) },
        ],
      },
      {
        path: '*',
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
]);
