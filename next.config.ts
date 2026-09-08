import type { NextConfig } from "next";

/**
 * Every file under public/ that is decoration rather than content, and whose
 * name is part of its identity. Vercel serves public/ with
 * `Cache-Control: public, max-age=0, must-revalidate` - only /_next/static gets
 * the immutable year, because only those names are content-hashed. These are
 * not, so the cache is bought with a rename discipline: changing one of these
 * files means changing its filename, or a returning visitor keeps the old one.
 *
 * Worth it here. It covers the ambient audio bed (1.4-2.1MB), eight decorative
 * MP4s, the six cursor bitmaps and the keynote's border art - all long-lived,
 * and all currently revalidated on every repeat visit.
 */
const IMMUTABLE_PUBLIC_PATHS = [
  "/audio/:path*",
  "/ads/:path*",
  "/countdown/:path*",
  "/cursors/:path*",
  "/keynote-frame.webp",
  "/button-accent.svg",
  // Season-pinned by filename, so it versions itself the way a hash would.
  "/mlh-trust-badge-2027-black.svg",
];

const nextConfig: NextConfig = {
  images: {
    // WebP avoids expensive cold AVIF encodes for the large illustrated plates.
    // Static imports retain hashed URLs and Next's responsive image caching.
    formats: ["image/webp"],

    /*
     * The default list tops out at 3840. Nothing here can fill it: the plates
     * are 2x LANCZOS upscales of 1920px art (scripts/upscale-backgrounds.py),
     * so a 3840-wide variant is interpolated pixels at full price - and
     * `sizes="100vw"` means a 2x-DPR laptop asked for exactly that.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    /*
     * Required from Next 16: a `quality` prop outside this list is a 400 from
     * the optimizer. 65 is for the full-bleed decorative plates, which are flat
     * illustrated art with broad gradients and hold up where a photograph
     * would not; 75 stays the default for anything the reader actually looks
     * at (the mascots, the wordmark, the keynote portrait).
     */
    qualities: [65, 75],
  },

  experimental: {
    /*
     * globals.css compiles to ~43KB of atomic Tailwind, render-blocking behind
     * a <link>. Inlining it into the head removes a round trip before first
     * paint, which is the trade the Next docs recommend for atomic CSS on a
     * site whose visitors are overwhelmingly first-time - which a hackathon
     * landing page is.
     */
    inlineCss: true,
  },

  async headers() {
    return IMMUTABLE_PUBLIC_PATHS.map((source) => ({
      source,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    }));
  },

  // Hides the floating Next.js badge in the corner during `next dev`. Compile
  // and runtime errors still surface. This is a dev-only overlay — it never
  // shipped to production in the first place.
  devIndicators: false,
};

export default nextConfig;
