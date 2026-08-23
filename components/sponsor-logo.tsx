import type { Sponsor } from "@/lib/types";
import { initials, sponsorLogoSrc } from "@/lib/format";

/**
 * Renders a sponsor's base64 logo, falling back to a monogram when the row has
 * no usable image.
 */
export function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const src = sponsorLogoSrc(sponsor.logo_data, sponsor.logo_content_type);

  if (!src) {
    return (
      <div
        aria-hidden
        className="flex h-16 w-full items-center justify-center rounded-md border border-dashed border-line font-mono text-sm text-muted"
      >
        {initials(sponsor.name) || "?"}
      </div>
    );
  }

  return (
    // next/image can't optimize a data: URI — it would pass through unoptimized
    // while still demanding explicit dimensions we don't have. A plain img is
    // both smaller and more honest here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${sponsor.name} logo`}
      loading="lazy"
      decoding="async"
      className="h-16 w-full object-contain"
    />
  );
}
