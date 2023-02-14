/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@codegouvfr/react-dsfr"],
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = nextConfig;
