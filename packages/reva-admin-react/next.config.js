/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin2",
  reactStrictMode: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
