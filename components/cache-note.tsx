/**
 * Explains the ISR delay in the UI, so nobody debugs a "broken" endpoint that
 * is really just serving a cached page. The window is read from the same
 * constant the fetches use, so this text can't drift out of sync.
 */
export function CacheNote({ seconds }: { seconds: number }) {
  const minutes = Math.round(seconds / 60);
  const window =
    seconds < 60
      ? `${seconds} second${seconds === 1 ? "" : "s"}`
      : `${minutes} minute${minutes === 1 ? "" : "s"}`;

  return (
    <aside className="rounded-md border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
      <span className="font-medium text-foreground">
        Data below is cached for {window}.
      </span>{" "}
      Changes made in the Go service won&apos;t show up until that window
      expires. Reloading won&apos;t help — not even a hard reload — because the
      page is cached on the server, not in your browser.
    </aside>
  );
}
