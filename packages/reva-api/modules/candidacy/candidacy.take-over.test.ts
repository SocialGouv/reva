/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep } from "@prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

test("candidacy_takeOver should fail when not authenticated", async function () {
  const candidacy = await createCandidacyHelper();
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacy.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("candidacy_takeOver should fail when user is admin", async function () {
  const candidacy = await createCandidacyHelper();
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacy.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("candidacy_takeOver should fail when candidacy manager has wrong organism", async function () {
  const candidacy = await createCandidacyHelper();
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: "00000000-0000-0000-0000-000000000000",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacy.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("candidacy_takeOver should do nothing when candidacy status is not validation", async function () {
  const candidacy = await createCandidacyHelper({
    status: CandidacyStatusStep.PROJET,
  });
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: candidacy.organism?.accounts[0].keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacy.id },
      returnFields: "{ id,status }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).not.toHaveProperty("errors");
  expect(resp.json()).toMatchObject({
    data: { candidacy_takeOver: { status: "PROJET" } },
  });
});

test("candidacy_takeOver should update candidacy statuses when active status is validation", async function () {
  const candidacy = await createCandidacyHelper({
    status: CandidacyStatusStep.VALIDATION,
  });
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: candidacy.organism?.accounts[0].keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacy.id },
      returnFields: "{ id }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).not.toHaveProperty("errors");
});
