/** @type {import('next').NextConfig} */
const isTest = process.env.APP_ENV === "test";

const nextConfig = {
  output: "standalone",
  basePath: "/candidat",
  reactStrictMode:
    process.env.NEXT_PUBLIC_REACT_STRICT_MODE != undefined
      ? JSON.parse(process.env.NEXT_PUBLIC_REACT_STRICT_MODE)
      : true,
  transpilePackages: ["@codegouvfr/react-dsfr"],
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
  distDir: isTest ? ".next-test" : ".next",
  eslint: {
    dirs: ["pages", "app", "components", "lib", "src", "cypress"],
  },
  experimental: {
    testProxy: isTest,
  },
};

module.exports = nextConfig;
