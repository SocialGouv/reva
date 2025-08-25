import { GraphQLClient } from "graphql-request";

import { STRAPI_GRAPHQL_API_URL } from "@/config/config";

const headers: Record<string, string> = {};

// Work around compression testProxy issue on first request
// https://github.com/vercel/next.js/issues/66238
if (process.env.APP_ENV === "test") {
  headers["Accept-Encoding"] = "identity";
}

export const strapi = new GraphQLClient(STRAPI_GRAPHQL_API_URL, { headers });
