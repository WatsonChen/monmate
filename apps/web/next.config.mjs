import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(appRoot, "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@monmate/types", "@monmate/config"],
  turbopack: {
    root: repoRoot
  }
};

export default nextConfig;
