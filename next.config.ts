import type { NextConfig } from "next";

/* STATIC_EXPORT=1 produces a fully static guest-mode build for
   GitHub Pages (basePath = repo name). Middleware and API routes
   are excluded by the export script (scripts/export-static.sh). */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath: "/HOROLITH",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
