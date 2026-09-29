import Image from "next/image";

import type { Sponsor } from "@/lib/types";
import { initials, logoSrc } from "@/lib/format";

/**
 * Renders a sponsor's logo from its HARP `logo_url`, falling back to a
 * monogram when the row has no usable image.
 *
 * The URL is versioned by the backend (`?v=<updated_at>`) and served with an
 * immutable Cache-Control, so next/image can cache the optimized variants for
 * the full year without a stale-logo risk.
 */
export function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const src = logoSrc(sponsor.logo_url);

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
    <div className="relative h-16 w-full">
      <Image
        src={src}
        alt={`${sponsor.name} logo`}
        fill
        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 240px"
        className="object-contain"
      />
    </div>
  );
}
