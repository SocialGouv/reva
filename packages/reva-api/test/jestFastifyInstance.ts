import { FastifyInstance } from "fastify";

import { buildApp } from "../infra/server/app";

import keycloakPluginMock from "./mocks/keycloak-plugin.mock";

export const getFastifyInstance = async () => {
  let app: FastifyInstance;

  try {
    app = await buildApp({ keycloakPluginMock });

    await app.listen({
      port: (process.env.PORT || 8081) as number,
      host: "0.0.0.0",
    });

    (global as any).fastify = app;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  return app;
};
