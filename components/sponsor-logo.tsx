import Image from "next/image";

import type { LogoFit } from "@/lib/logo-fit";
import type { Sponsor } from "@/lib/types";
import { initials, logoSrc } from "@/lib/format";

/**
 * Renders a sponsor's logo from its HARP `logo_url`, exactly as supplied,
 * filling its parent - or a monogram when the row has no usable image.
 *
 * With a `fit` (lib/logo-fit.ts), the parent has the shape of the logo itself
 * rather than of the file, and the image is offset inside it so the file's
 * empty margins fall outside and are clipped. Only margins that look
 * identical once cropped are ever left out, so the logo looks the same either
 * way; it just stops being sized by its padding.
 *
 * The URL is versioned by the backend (`?v=<updated_at>`) and served with an
 * immutable Cache-Control, so next/image can cache the optimized variants for
 * the full year without a stale-logo risk.
 *
 * The monogram is hidden from screen readers because the cell already names
 * the sponsor.
 */
export function SponsorLogo({
  sponsor,
  fit,
  sizes,
}: {
  sponsor: Sponsor;
  fit: LogoFit | null;
  sizes: string;
}) {
  const src = logoSrc(sponsor.logo_url);
  const alt = `${sponsor.name} logo`;

  if (!src) {
    return (
      <div
        aria-hidden
        className="font-elevon flex h-full w-full items-center justify-center text-[22cqh] leading-none font-extrabold tracking-[0.08em] text-white"
      >
        {initials(sponsor.name) || "?"}
      </div>
    );
  }

  if (!fit || fit.width === 0 || fit.height === 0) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain"
      />
    );
  }

  const { box } = fit;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={fit.width}
        height={fit.height}
        sizes={sizes}
        className="absolute max-w-none"
        style={{
          left: `${(-box.x / box.width) * 100}%`,
          top: `${(-box.y / box.height) * 100}%`,
          width: `${100 / box.width}%`,
          height: `${100 / box.height}%`,
        }}
      />
    </div>
  );
}
