/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin2",
  reactStrictMode:
    process.env.NEXT_PUBLIC_REACT_STRICT_MODE != undefined
      ? JSON.parse(process.env.NEXT_PUBLIC_REACT_STRICT_MODE)
      : true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
