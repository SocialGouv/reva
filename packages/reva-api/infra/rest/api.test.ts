import path from "path";

import dotenv from "dotenv";
import { FastifyInstance } from "fastify";

import { buildApp } from "../server/app";
import keycloakPluginMock from "../../test/mocks/keycloak-plugin.mock";
dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = await buildApp({keycloakPluginMock});
});

test("Ping should pong", async () => {
  const response = await fastify.inject({
    method: "GET",
    url: "/ping",
  });
  expect(response.statusCode).toEqual(200);
  expect(response.body).toEqual("pong");
});
