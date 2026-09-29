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
 * MP4s and the six cursor bitmaps - all long-lived, and all currently
 * revalidated on every repeat visit.
 */
const IMMUTABLE_PUBLIC_PATHS = [
  "/audio/:path*",
  "/ads/:path*",
  "/countdown/:path*",
  "/cursors/:path*",
  "/button-accent.svg",
  // Season-pinned by filename, so it versions itself the way a hash would.
  "/mlh-trust-badge-2027-black.svg",
];

/**
 * Sponsor and track logos are served by HARP at
 * `{HARP_API_BASE_URL}/v1/public/{sponsors,tracks}/{id}/logo?v=<updated_at>`,
 * keyless, so next/image can fetch them directly. The env var is read at build
 * time here; it is the same one lib/api.ts uses at request time, so the two
 * cannot drift. Without it no remote host is allowed and remote logos 400 at
 * the optimizer - loud, rather than silently unoptimized.
 */
function harpLogoRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const base = process.env.HARP_API_BASE_URL;
  if (!base) return [];

  const { protocol, hostname, port } = new URL(base);
  if (protocol !== "https:" && protocol !== "http:") return [];

  return [
    {
      protocol: protocol.slice(0, -1) as "https" | "http",
      hostname,
      port,
      // ?v= is the logo version and varies per upload, so `search` is left
      // unrestricted; the pathname keeps this to logo routes only.
      pathname: "/v1/public/*/*/logo",
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: harpLogoRemotePatterns(),

    /*
     * Next 16 refuses to optimize images whose host resolves to a private or
     * loopback IP. Locally HARP runs on localhost, so logos 400 without this.
     * Dev only: production keeps the SSRF protection.
     */
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",

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
     * at (the wordmark).
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
