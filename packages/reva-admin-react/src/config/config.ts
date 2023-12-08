export const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_REACT_GRAPHQL_API_URL ||
  "http://localhost:8080/api/graphql";

export const ADMIN_ELM_URL =
  process.env.NEXT_PUBLIC_ADMIN_ELM_URL || "http://localhost:3000/admin";

export const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
export const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
export const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
