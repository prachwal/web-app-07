import { useRouteError, isRouteErrorResponse } from 'react-router';
import { ErrorLayout } from '@/components/layout/ErrorLayout';

export function ErrorPage(): React.JSX.Element {
  const error = useRouteError();

  let status = 'Error';
  let message = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <ErrorLayout
      status={status}
      message={message}
      linkLabel="Wróć do strony głównej"
    />
  );
}
