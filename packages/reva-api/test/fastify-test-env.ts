import NodeEnvironment from "jest-environment-node";

import { FastifyInstance } from "fastify";
import { buildApp } from "../infra/server/app";
import keycloakPluginMock from "./mocks/keycloak-plugin.mock";

class FastifyEnvironment extends NodeEnvironment {
  server: FastifyInstance;

  async setup(): Promise<void> {
    await super.setup();

    try {
      this.server = await buildApp({ keycloakPluginMock });

      await this.server.listen({
        port: (process.env.PORT || 8081) as number,
        host: "0.0.0.0",
      });

      this.global.fastify = this.server;
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  async teardown(): Promise<void> {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          resolve(true);
        });
      });
    }

    await super.teardown();
  }
}

module.exports = FastifyEnvironment;
