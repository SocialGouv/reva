import path from "path";

import dotenv from "dotenv";
import { FastifyInstance } from "fastify";

import { candidateJPL } from "../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import keycloakPluginMock from "../../../test/mocks/keycloak-plugin.mock";
import { seed } from "../../../test/seed";
import { prismaClient } from "../../database/postgres/client";
import { buildApp } from "../../server/app";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

let fastify: FastifyInstance;
let sampleCandidacy1Id: string;

beforeAll(async () => {
  // Construct server
  await seed();
  fastify = await buildApp({ keycloakPluginMock });

  // Create candidacy
  const candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateJPL.email,
      email: candidateJPL.email,
      candidateId: candidateJPL.id,
    },
  });
  sampleCandidacy1Id = candidacy.id;
});

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
      arguments: { candidacyId: sampleCandidacy1Id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(403);
});

test.only("get existing Candidacy with admin user", async () => {
  const resp = await injectGraphql({
    fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCandidacyById",
      arguments: { id: sampleCandidacy1Id },
      returnFields:
        "{organismId, firstname, lastname, email, candidacyStatuses {createdAt, isActive, status}}",
    },
  });
  expect(resp.statusCode).toEqual(200);
});
