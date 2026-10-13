import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(appRoot, "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@monmate/types", "@monmate/config"],
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/admin/:path*", headers: noindex },
      { source: "/staff/:path*", headers: noindex },
      { source: "/checkin", headers: noindex },
      { source: "/event/:slug/checkin", headers: noindex },
      { source: "/event/:slug/ticket", headers: noindex },
      { source: "/event/:slug/survey", headers: noindex }
    ];
  },
  turbopack: {
    root: repoRoot
  }
};

export default nextConfig;
