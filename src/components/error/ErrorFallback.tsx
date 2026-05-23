import { type FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getErrorMessage, getErrorStack } from '@/lib/error.utils';

export function ErrorFallback({ error }: FallbackProps) {
  const { t } = useTranslation();
  const message = getErrorMessage(error);
  const stack = getErrorStack(error);

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-4 py-12"
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('errors.somethingWentWrong')}</CardTitle>
          <CardDescription>
            {t('errors.unexpectedError')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {import.meta.env.DEV ? (
            <div className="space-y-2">
              <div className="rounded-md border bg-muted p-3 text-sm">{message}</div>
              {stack ? (
                <pre className="max-h-60 overflow-auto rounded-md border bg-muted p-3 text-xs">
                  {stack}
                </pre>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => window.location.reload()}>
              {t('errors.reloadPage')}
            </Button>
            <Button asChild variant="outline" type="button">
              <Link to="/">{t('errors.goHome')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
