import path from "path";

import dotenv from "dotenv";
import { FastifyInstance } from "fastify";

import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import {
  injectGraphql,
} from "../../../test/helpers/graphql-helper";
import keycloakPluginMock from "../../../test/mocks/keycloak-plugin.mock";
import { buildApp } from "../../server/app";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

let fastify: FastifyInstance;

beforeAll(async () => {
  // Create database

  // Construct server
  fastify = await buildApp({ keycloakPluginMock });
});

const candidacyId = "c29b8bea-7f6c-471d-b52b-5dd71cc7c167";

test("candidacy_takeOver should fail when not authenticated", async () => {
  const resp = await injectGraphql({
    fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId },
      returnFields: "{ id }",
    }
  });

  expect(resp.statusCode).toEqual(403);
});

test.only("get existing Candidacy with admin user", async() => {
  const resp = await injectGraphql({
    fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCandidacyById",
      arguments: {id: candidacyId},
      returnFields: "{organismId, firstname, lastname, email, candidacyStatuses {createdAt, isActive, status}}"
    }
  });
  expect(resp.statusCode).toEqual(200);
})