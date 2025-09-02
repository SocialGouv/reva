import { GraphQLClient } from "graphql-request";

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL || "http://localhost:1337";

const STRAPI_GRAPHQL_API_URL = STRAPI_BASE_URL + "/graphql";

const headers: Record<string, string> = {};

// Work around compression testProxy issue on first request
// https://github.com/vercel/next.js/issues/66238
if (process.env.APP_ENV === "test") {
  headers["Accept-Encoding"] = "identity";
}

export const strapi = new GraphQLClient(STRAPI_GRAPHQL_API_URL, { headers });
