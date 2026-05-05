const path = require("path");

const isTest = process.env.APP_ENV === "test";

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
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  async rewrites() {
    return [
      {
        source: "/websiteapi/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/espace-professionnel",
        destination:
          "/savoir-plus/articles/espace-architecte-accompagnateur-de-parcours",
        permanent: false,
      },
    ];
  },
  distDir: isTest ? ".next-test" : ".next",
  experimental: {
    testProxy: isTest,
  },
  logging: {
    browserToTerminal: "error",
  },
};

module.exports = nextConfig;
