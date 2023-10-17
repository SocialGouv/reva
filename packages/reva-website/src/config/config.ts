export const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_WEBSITE_API_GRAPHQL ||
  "http://localhost:8080/api/graphql";

export const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL || "http://localhost:1337";

export const STRAPI_GRAPHQL_API_URL = STRAPI_BASE_URL + "/graphql";

export const MATOMO = {
  URL: process.env.NEXT_PUBLIC_MATOMO_URL,
  SITE_ID: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
  CONTAINER_NAME: process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME,
};

export const CRISP = {
  WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
};

export const FeatureFlags = {
  CANDIDATE_ORIENTATION: process.env.NEXT_PUBLIC_FEATURE_CANDIDATE_ORIENTATION,
};
