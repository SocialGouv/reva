/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { Candidacy } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertFiliereOrganism,
} from "../../test/helpers/create-db-entity";
import { candidateJPL } from "../../test/fixtures/people-organisms";

let candidacy: Candidacy;

beforeEach(async () => {
  await createExpertFiliereOrganism();
  await createCandidateJPL();
  candidacy = await createCandidacyUnifvae();
});

afterEach(async () => {
  await prismaClient.trainingOnFundingRequestsUnifvae.deleteMany();
  await prismaClient.basicSkillOnFundingRequestsUnifvae.deleteMany();
  await prismaClient.candidacyDropOut.deleteMany();
  await prismaClient.feasibility.deleteMany({});
  await prismaClient.candidaciesStatus.deleteMany();
  await prismaClient.basicSkillOnCandidacies.deleteMany();
  await prismaClient.candidacyLog.deleteMany();
  await prismaClient.candidacy.deleteMany();
  await prismaClient.account.updateMany({ data: { organismId: null } });
  await prismaClient.organism.deleteMany();
  await prismaClient.maisonMereAAPOnConventionCollective.deleteMany();
  await prismaClient.maisonMereAAP.deleteMany();
  await prismaClient.account.deleteMany();
  await prismaClient.candidate.deleteMany();
});

test("candidate should be able to change it's type_accompagnement when the candidacy is still in project", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateJPL.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateTypeAccompagnement",
      arguments: { candidacyId: candidacy.id, typeAccompagnement: "AUTONOME" },
      returnFields: "{id,typeAccompagnement}",
      enumFields: ["typeAccompagnement"],
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.candidacy_updateTypeAccompagnement).toMatchObject({
    typeAccompagnement: "AUTONOME",
  });
});

test("candidate should NOT be able to change it's type_accompagnement when the candidacy is not in project", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: { status: "VALIDATION" },
  });
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateJPL.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateTypeAccompagnement",
      arguments: { candidacyId: candidacy.id, typeAccompagnement: "AUTONOME" },
      returnFields: "{id,typeAccompagnement}",
      enumFields: ["typeAccompagnement"],
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "Impossible de modifier le type d'accompagnement une fois la candidature envoyée",
  );
});
