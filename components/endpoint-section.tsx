/**
 * One public endpoint's worth of data, with its own failure state so a single
 * unreachable endpoint doesn't blank the whole page.
 */
export function EndpointSection({
  title,
  path,
  error,
  count,
  children,
}: {
  title: string;
  path: string;
  error?: string;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <code className="font-mono text-xs text-muted">{path}</code>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-danger/40 px-3 py-2 font-mono text-xs text-danger">
          {error}
        </p>
      ) : count === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Reached the endpoint — it returned no items yet.
        </p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}
