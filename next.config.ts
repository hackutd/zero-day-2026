import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * AVIF first, WebP second. Next already converts and resizes on the way
     * out, so this only changes which format a browser is offered: AVIF runs
     * roughly 20-30% under WebP at the same visual quality, and anything that
     * cannot take it falls back to WebP and then to the original.
     *
     * The cost is encode time on the first request for a given size, which is
     * cached afterwards. Nothing about the source plates changes.
     */
    formats: ["image/avif", "image/webp"],
  },
  // Hides the floating Next.js badge in the corner during `next dev`. Compile
  // and runtime errors still surface. This is a dev-only overlay — it never
  // shipped to production in the first place.
  devIndicators: false,
};

export default nextConfig;
