/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import {
  Candidacy,
  CandidacyStatusStep,
  Candidate,
  Organism,
} from "@prisma/client";

import { prismaClient } from "../../prisma/client";

import { Account } from "modules/account/account.types";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import {
  createCandidateMan,
  createCandidateWoman,
  createExpertFiliereOrganism,
} from "../../test/helpers/create-db-entity";
import { injectGraphql } from "../../test/helpers/graphql-helper";

let organism: Organism,
  organismAccount: Account,
  candidateMan: Candidate,
  candidateWoman: Candidate,
  candidacyProject: Candidacy,
  candidacyValidated: Candidacy;

beforeAll(async () => {
  const res = await createExpertFiliereOrganism();
  organism = res.organism;
  organismAccount = res.account;

  candidateMan = await createCandidateMan();
  candidateWoman = await createCandidateWoman();

  candidacyProject = await prismaClient.candidacy.create({
    data: {
      candidateId: candidateMan.id,
      organismId: organism.id,
      status: CandidacyStatusStep.PROJET,
      candidacyStatuses: {
        createMany: {
          data: [
            {
              isActive: true,
              status: CandidacyStatusStep.PROJET,
            },
          ],
        },
      },
    },
  });
  candidacyValidated = await prismaClient.candidacy.create({
    data: {
      candidateId: candidateWoman.id,
      organismId: organism.id,
      status: CandidacyStatusStep.VALIDATION,
      candidacyStatuses: {
        createMany: {
          data: [
            {
              isActive: false,
              status: CandidacyStatusStep.PROJET,
            },
            {
              isActive: true,
              status: CandidacyStatusStep.VALIDATION,
            },
          ],
        },
      },
    },
  });
});

test("candidacy_takeOver should fail when not authenticated", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacyProject.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("candidacy_takeOver should fail when user is admin", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacyProject.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("candidacy_takeOver should fail when candidacy manager has wrong organism", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: "00000000-0000-0000-0000-000000000000",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacyProject.id },
      returnFields: "{ id }",
    },
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
});

test("candidacy_takeOver should do nothing when candidacy status is not validation", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismAccount.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacyProject.id },
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
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismAccount.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_takeOver",
      arguments: { candidacyId: candidacyValidated.id },
      returnFields: "{ id }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).not.toHaveProperty("errors");
});
