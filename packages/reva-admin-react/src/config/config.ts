export const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_REACT_GRAPHQL_API_URL ||
  "http://localhost:8080/api/graphql";

export const REST_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_REACT_REST_API_URL ||
  "http://localhost:8080/api";

export const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
export const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
export const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL;

export const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
export const MATOMO_CONTAINER_NAME =
  process.env.NEXT_PUBLIC_MATOMO_CONTAINER_NAME;

export const WEBSITE_BASE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_BASE_URL || "https://vae.gouv.fr";
