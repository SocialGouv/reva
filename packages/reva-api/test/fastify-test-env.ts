import NodeEnvironment from "jest-environment-node";

import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { buildApp } from "../infra/server/app";
import keycloakPluginMock from "./mocks/keycloak-plugin.mock";

class FastifyEnvironment extends NodeEnvironment {
  server: FastifyInstance;
  prismaClient: PrismaClient;

  async setup(): Promise<void> {
    await super.setup();

    try {
      this.server = await buildApp({ keycloakPluginMock });

      await this.server.listen({
        port: (process.env.PORT || 8081) as number,
        host: "0.0.0.0",
      });

      this.global.fastify = this.server;

      this.prismaClient = new PrismaClient();
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  async teardown(): Promise<void> {
    await this.prismaClient.$disconnect();
    await this.server.close();
    await super.teardown();
  }
}

module.exports = FastifyEnvironment;
