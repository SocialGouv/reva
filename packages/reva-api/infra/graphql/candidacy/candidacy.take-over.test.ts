/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Account, Candidacy, Candidate, Organism } from "@prisma/client";
import { CandidacyStatusStep } from "@prisma/client";

import {
  candidateJPL,
  candidateMPB,
  organismDummy1,
  organismDummy2,
} from "../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { prismaClient } from "../../database/postgres/client";

let rightOrganism: Organism,
  wrongOrganism: Organism,
  candidate1: Candidate,
  candidate2: Candidate,
  candidacyProject: Candidacy,
  candidacyValidated: Candidacy,
  rightCandidacyManager: Account,
  wrongCandidacyManager: Account;
const rightCandidacyManagerKcId = "e4965f17-6c39-4ed2-8786-e504e320e476",
  wrongCandidacyManagerKcId = "45cb2519-4b1e-4861-849a-087f80651b73";

beforeAll(async () => {
  const ileDeFrance = await prismaClient.department.findFirst({
    where: { code: "75" },
  });
  wrongOrganism = await prismaClient.organism.create({
    data: organismDummy2,
  });
  wrongCandidacyManager = await prismaClient.account.create({
    data: {
      email: organismDummy2.contactAdministrativeEmail,
      keycloakId: wrongCandidacyManagerKcId,
      organismId: wrongOrganism.id,
    },
  });
  rightOrganism = await prismaClient.organism.create({ data: organismDummy1 });
  rightCandidacyManager = await prismaClient.account.create({
    data: {
      email: organismDummy1.contactAdministrativeEmail,
      keycloakId: rightCandidacyManagerKcId,
      organismId: rightOrganism.id,
    },
  });
  candidate1 = await prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: ileDeFrance?.id || "" },
  });
  candidate2 = await prismaClient.candidate.create({
    data: { ...candidateMPB, departmentId: ileDeFrance?.id || "" },
  });
  candidacyProject = await prismaClient.candidacy.create({
    data: {
      deviceId: candidate1.email,
      email: candidate1.email,
      candidateId: candidate1.id,
      organismId: rightOrganism.id,
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
      deviceId: candidate1.email,
      email: candidate1.email,
      candidateId: candidate2.id,
      organismId: rightOrganism.id,
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

afterAll(async () => {
  await prismaClient.candidaciesStatus.deleteMany({
    where: {
      candidacyId: { in: [candidacyProject.id, candidacyValidated.id] },
    },
  });
  await prismaClient.candidacy.deleteMany({
    where: { id: { in: [candidacyProject.id, candidacyValidated.id] } },
  });
  await prismaClient.candidate.deleteMany({
    where: { id: { in: [candidate1.id, candidate2.id] } },
  });
  await prismaClient.organism.deleteMany({
    where: { id: { in: [rightOrganism.id, wrongOrganism.id] } },
  });
  await prismaClient.account.deleteMany({
    where: { id: { in: [rightCandidacyManager.id, wrongCandidacyManager.id] } },
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
      keycloakId: wrongCandidacyManagerKcId,
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

test("candidacy_takeOver should fail when candidacy status is not validation", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: rightCandidacyManagerKcId,
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

test("candidacy_takeOver should update candidacy statuses when active status is validation", async function () {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: rightCandidacyManagerKcId,
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
