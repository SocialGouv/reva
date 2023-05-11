/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@codegouvfr/react-dsfr"],
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true }, //needed for next export
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/espace-professionnel/creation",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
