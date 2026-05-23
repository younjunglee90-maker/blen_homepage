import { HelmetProvider } from 'react-helmet-async';

import { AppBootstrap } from '@/AppBootstrap';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useDocumentLanguage } from '@/hooks/useDocumentLanguage';

export default function App() {
  useDocumentLanguage();

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AppBootstrap />
      </ErrorBoundary>
    </HelmetProvider>
  );
}
