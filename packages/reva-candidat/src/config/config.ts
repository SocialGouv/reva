export const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_APP_CANDIDAT_GRAPHQL_API_URL ||
  "http://localhost:8080/api/graphql";

export const REST_API_URL =
  process.env.NEXT_PUBLIC_APP_CANDIDAT_REST_API_URL ||
  "http://localhost:8080/api";

export const KEYCLOAK_CLIENT_ID =
  process.env.NEXT_PUBLIC_APP_CANDIDAT_KEYCLOAK_CLIENT_ID;
export const KEYCLOAK_REALM =
  process.env.NEXT_PUBLIC_APP_CANDIDAT_KEYCLOAK_REALM;
export const KEYCLOAK_URL = process.env.NEXT_PUBLIC_APP_CANDIDAT_KEYCLOAK_URL;
