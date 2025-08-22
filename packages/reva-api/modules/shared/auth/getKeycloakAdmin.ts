import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import { logger } from "@/modules/shared/logger";

export const getKeycloakAdmin = async () => {
  const kcAdminClient = new KeycloakAdminClient({
    baseUrl: process.env.KEYCLOAK_ADMIN_URL,
    realmName: process.env.KEYCLOAK_ADMIN_REALM,
  });

  try {
    await kcAdminClient.auth({
      grantType: "client_credentials",
      clientId: process.env.KEYCLOAK_ADMIN_CLIENTID || "admin-cli",
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    });
  } catch (e) {
    logger.error(e);
  }

  return kcAdminClient;
};
