/**
 * Shown until the backend env vars are present, so a fresh clone explains
 * itself instead of rendering an empty page or a stack trace.
 */
export function SetupGuide({ missing }: { missing: string[] }) {
  return (
    <section className="rounded-lg border border-warn/40 bg-surface p-5">
      <h2 className="text-base font-semibold text-warn">
        Not connected to the Go service yet
      </h2>
      <p className="mt-2 text-sm text-muted">
        Missing:{" "}
        {missing.map((name, i) => (
          <span key={name}>
            {i > 0 && ", "}
            <code className="font-mono text-foreground">{name}</code>
          </span>
        ))}
      </p>

      <ol className="mt-5 space-y-4 text-sm">
        <Step n={1} title="Copy the example env file">
          <Code>cp .env.example .env.local</Code>
        </Step>
        <Step n={2} title="Start the Go backend from the repo root">
          <Code>air</Code>
          <p className="mt-2 text-muted">
            It listens on <code className="font-mono">:8080</code>, which is the
            default <code className="font-mono">HARP_API_BASE_URL</code>.
          </p>
        </Step>
        <Step n={3} title="Set the public API key">
          <p className="text-muted">
            <code className="font-mono">HARP_PUBLIC_API_KEY</code> must match{" "}
            <code className="font-mono">PUBLIC_API_KEY</code> in the
            backend&apos;s <code className="font-mono">.env</code>. The{" "}
            <code className="font-mono">/v1/public/*</code> routes sit behind an
            API-key middleware, so requests without it get a 401.
          </p>
        </Step>
        <Step n={4} title="Restart the dev server">
          <Code>npm run dev</Code>
          <p className="mt-2 text-muted">
            Next reads env files at startup, so edits to{" "}
            <code className="font-mono">.env.local</code> need a restart.
          </p>
        </Step>
      </ol>
    </section>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs">
        {n}
      </span>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <div className="mt-1.5">{children}</div>
      </div>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-line bg-background px-3 py-2 font-mono text-xs">
      {children}
    </pre>
  );
}
