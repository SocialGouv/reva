import path from "path";

import type { NextConfig } from "next";

const isTest = process.env.APP_ENV === "test";

const nextConfig: NextConfig = {
  basePath: "/vae-collective",
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  distDir: isTest ? ".next-test" : ".next",
  experimental: {
    testProxy: isTest,
  },
};

// eslint-disable-next-line import/no-unused-modules
export default nextConfig;
