import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating Next.js badge in the corner during `next dev`. Compile
  // and runtime errors still surface. This is a dev-only overlay — it never
  // shipped to production in the first place.
  devIndicators: false,
};

export default nextConfig;
