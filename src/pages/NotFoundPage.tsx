import { ErrorLayout } from '@/components/layout/ErrorLayout';

export function NotFoundPage(): React.JSX.Element {
  return (
    <ErrorLayout
      status="404"
      message="Page not found."
      linkLabel="Go home"
    />
  );
}
