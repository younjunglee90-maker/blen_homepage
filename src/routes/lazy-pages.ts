import { lazy } from 'react';

export const HomePage = lazy(() => import('@/pages/Home'));
export const TermsOfServicePage = lazy(() => import('@/pages/TermsOfService'));
export const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicy'));
export const SupportPage = lazy(() => import('@/pages/SupportPage'));
export const NotFoundPage = lazy(() => import('@/pages/NotFound'));
