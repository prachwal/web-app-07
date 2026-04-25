/**
 * Full-screen loading indicator shown as the Suspense fallback
 * while a lazy-loaded page chunk is being fetched.
 *
 * @returns The page loader element
 */
export function PageLoader(): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label="Ładowanie strony"
      className="flex min-h-screen items-center justify-center"
    >
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"
      />
    </div>
  );
}
