/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/candidat",
  reactStrictMode:
    process.env.NEXT_PUBLIC_REACT_STRICT_MODE != undefined
      ? JSON.parse(process.env.NEXT_PUBLIC_REACT_STRICT_MODE)
      : true,
  transpilePackages: ["@codegouvfr/react-dsfr"],
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
  rewrites: async () => {
    return [
      {
        source: "/api/preview/:path*",
        destination: "http://localhost:8080/api/preview/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
