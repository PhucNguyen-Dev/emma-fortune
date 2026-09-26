import type { NextConfig } from "next";

/**
 * Local runs (`pnpm dev` / `pnpm build` + `pnpm start`) work exactly as before.
 *
 * For publishing to GitHub Pages (served under /emma-fortune/), set:
 *   NEXT_OUTPUT=export NEXT_PUBLIC_BASE_PATH=/emma-fortune pnpm build
 * which produces a fully static `out/` folder.
 */
const isExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" as const, trailingSlash: true } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
