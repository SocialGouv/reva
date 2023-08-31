import KcAdminClient from "@keycloak/keycloak-admin-client";
import { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";

import { logger } from "../../../modules/shared/logger";

const keycloakAdminPlugin: FastifyPluginCallback<Record<string, never>> = (
  app,
  _opts,
  next
): void => {
  const kcAdminClient = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_ADMIN_URL,
    realmName: process.env.KEYCLOAK_ADMIN_REALM,
  });

  const getKeycloakAdmin = async () => {
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

  app.decorate("getKeycloakAdmin", getKeycloakAdmin);

  next();
};

export default fp(keycloakAdminPlugin);
