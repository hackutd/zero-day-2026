/** Narrows an unknown thrown value to a displayable message. */
export function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/**
 * Validates a `logo_url` from the HARP public API.
 *
 * The backend emits an absolute, keyless, versioned URL (or "" when a row has
 * no logo). Only http(s) URLs are passed through: anything else - including a
 * legacy `data:` URI - has no business in `next/image`, whose optimizer would
 * reject it anyway.
 *
 * Returns null when there's no usable logo, so callers can fall back.
 */
export function logoSrc(logoUrl: string): string | null {
  if (!logoUrl) return null;

  try {
    const { protocol } = new URL(logoUrl);
    return protocol === "https:" || protocol === "http:" ? logoUrl : null;
  } catch {
    return null;
  }
}

/** First letters of a sponsor name, for the no-logo fallback. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
