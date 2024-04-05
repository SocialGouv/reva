import KeycloakAdminClientClass from "@keycloak/keycloak-admin-client";
import { logger } from "../../shared/logger";

const dynamicImport = async (packageName: string) =>
  new Function(`return import('${packageName}')`)();

export const getKeycloakAdmin = async () => {
  const KeycloakAdminClient = (
    await dynamicImport("@keycloak/keycloak-admin-client")
  ).default as typeof KeycloakAdminClientClass;
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
