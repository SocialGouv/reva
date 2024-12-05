/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@codegouvfr/react-dsfr"],
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true }, //needed for next export
  trailingSlash: true,
  async rewrites() {
    return [{ source: "/websiteapi/:path*", destination: "/api/:path*" }];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });

    return config;
  },
  eslint: {
    dirs: ["pages", "app", "components", "lib", "src", "cypress"],
  },
};

module.exports = nextConfig;
