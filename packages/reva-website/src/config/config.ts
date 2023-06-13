export const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_WEBSITE_API_GRAPHQL ||
  "http://localhost:8080/api/graphql";

export const MATOMO = {
  URL: process.env.NEXT_PUBLIC_MATOMO_URL,
  SITE_ID: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
  CONTAINER_NAME: process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME,
};

export const CRISP = {
  WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
};
