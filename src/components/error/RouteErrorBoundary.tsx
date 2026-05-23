import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getErrorMessage, getErrorStack } from '@/lib/error.utils';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText || t('errors.somethingWentWrong')}`
    : t('errors.somethingWentWrong');

  const message = isRouteErrorResponse(error)
    ? typeof error.data === 'string'
      ? error.data
      : t('errors.unexpectedError')
    : getErrorMessage(error);

  const stack = !isRouteErrorResponse(error) ? getErrorStack(error) : undefined;

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-4 py-12"
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{t('errors.unexpectedError')}</CardDescription>
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
