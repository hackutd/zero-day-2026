import type { ConfigStatus } from "@/lib/api";

/**
 * Shows how this app is wired to the Go service. The base URL is safe to
 * render; the API key is never displayed, only reported as present or missing.
 */
export function ConnectionPanel({ status }: { status: ConfigStatus }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted">
        Backend connection
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Row label="HARP_API_BASE_URL">
          {status.configured ? (
            <code className="font-mono text-sm break-all">
              {status.baseUrl}
            </code>
          ) : (
            <Missing />
          )}
        </Row>
        <Row label="HARP_PUBLIC_API_KEY">
          {status.configured ||
          !status.missing.includes("HARP_PUBLIC_API_KEY") ? (
            <span className="text-sm text-ok">set (hidden)</span>
          ) : (
            <Missing />
          )}
        </Row>
      </dl>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-xs text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function Missing() {
  return <span className="text-sm text-danger">not set</span>;
}
