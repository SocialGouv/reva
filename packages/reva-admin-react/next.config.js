const path = require("path");

const isTest = process.env.APP_ENV === "test";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/admin2",
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
  turbopack: {
    root: path.resolve(__dirname, "../.."),
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
  experimental: {
    testProxy: isTest,
  },
};

module.exports = nextConfig;
