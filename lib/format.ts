/** Narrows an unknown thrown value to a displayable message. */
export function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/**
 * Builds a data URI for a sponsor logo.
 *
 * The backend stores logos as raw base64 in `logo_data` with the MIME type in
 * `logo_content_type` - not as a URL. This mirrors how the portal renders them
 * (client/portal/src/pages/admin/sponsors/components/SponsorsTable.tsx).
 *
 * Returns null when there's no usable logo, so callers can fall back.
 */
export function sponsorLogoSrc(
  logoData: string,
  contentType: string,
): string | null {
  if (!logoData) return null;

  // Tolerate rows that already hold a full data URI.
  if (logoData.startsWith("data:")) return logoData;

  // Only ever emit image/* - a data URI built from an unexpected content type
  // has no business in an <img> tag.
  if (!/^image\/[a-z0-9.+-]+$/i.test(contentType)) return null;

  // Postgres round-trips can reintroduce newlines into base64 payloads.
  return `data:${contentType};base64,${logoData.replace(/\s/g, "")}`;
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
