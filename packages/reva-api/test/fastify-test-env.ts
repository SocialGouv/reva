import NodeEnvironment from "jest-environment-node";

import { buildApp } from "../infra/server/app";
import keycloakPluginMock from "./mocks/keycloak-plugin.mock";
import { FastifyInstance } from "fastify";

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
    await super.teardown();

    this.server.close();
  }
}

module.exports = FastifyEnvironment;
