import KcAdminClient from "@keycloak/keycloak-admin-client";
import fp from "fastify-plugin";

async function keycloakAdminPlugin(app: any, opts: any, next: any) {
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
      console.log(e);
    }

    return kcAdminClient;
  };

  app.decorate("getKeycloakAdmin", getKeycloakAdmin);

  next();
}

export default fp(keycloakAdminPlugin);
