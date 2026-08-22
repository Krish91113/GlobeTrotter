import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production-build output separate from the active development cache.
  // Running `next build` while `next dev` is open otherwise corrupts `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
