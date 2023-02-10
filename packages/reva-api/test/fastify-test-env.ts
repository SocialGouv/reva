import NodeEnvironment from "jest-environment-node";

import { buildApp } from "../infra/server/app";
import keycloakPluginMock from "./mocks/keycloak-plugin.mock";

class FastifyEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    this.global.fastify = await buildApp({ keycloakPluginMock });
  }
}

module.exports = FastifyEnvironment;
