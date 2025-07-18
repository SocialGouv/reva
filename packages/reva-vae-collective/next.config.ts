import type { NextConfig } from "next";

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
  experimental: {
    testProxy: process.env.APP_ENV === "test",
  },
};

// eslint-disable-next-line import/no-unused-modules
export default nextConfig;
