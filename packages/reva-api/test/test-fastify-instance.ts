import { FastifyInstance } from "fastify";

import { buildApp } from "../infra/server/app";

import keycloakPluginMock from "./mocks/keycloak-plugin.mock";

export const getFastifyInstance = async () => {
  let app: FastifyInstance;

  try {
    app = await buildApp({ keycloakPluginMock });

    await app.listen({
      port: 0, // Let system assign available port
      host: "127.0.0.1",
    });

    global.testApp = app;
  } catch (err) {
    console.log(err);
    throw err;
  }

  return app;
};
