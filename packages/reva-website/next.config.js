/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@codegouvfr/react-dsfr"],
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "healing-nature-bb0384846f.media.strapiapp.com",
        port: "",
      },
    ],
  },
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
    dirs: ["app", "components", "lib", "src", "cypress"],
  },
  experimental: {
    testProxy: process.env.APP_ENV === "test",
  },
};

module.exports = nextConfig;
