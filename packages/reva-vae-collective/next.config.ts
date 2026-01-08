import type { NextConfig } from "next";

const isTest = process.env.APP_ENV === "test";

const nextConfig: NextConfig = {
  basePath: "/vae-collective",
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
  distDir: isTest ? ".next-test" : ".next",
  experimental: {
    testProxy: isTest,
  },
};

// eslint-disable-next-line import/no-unused-modules
export default nextConfig;
