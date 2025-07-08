export const KEYCLOAK_CLIENT_ID =
  process.env.NEXT_PUBLIC_APP_VAE_COLLECTIVE_KEYCLOAK_CLIENT_ID ||
  "reva-vae-collective";
export const KEYCLOAK_REALM =
  process.env.NEXT_PUBLIC_APP_VAE_COLLECTIVE_KEYCLOAK_REALM || "reva";
export const KEYCLOAK_URL =
  process.env.NEXT_PUBLIC_APP_VAE_COLLECTIVE_KEYCLOAK_URL ||
  "http://localhost:8888/auth";
