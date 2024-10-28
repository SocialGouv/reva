/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { Candidacy } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertFiliereOrganism,
} from "../../../test/helpers/create-db-entity";
import { gestionnaireMaisonMereAAP1 } from "../../../test/fixtures/people-organisms";
import { logger } from "../../shared/logger";

let candidacy: Candidacy;

const basicTrainingForm = {
  certificateSkills: "My certificate skills",
  otherTraining: "My other training",
  individualHourCount: 1,
  collectiveHourCount: 2,
  additionalHourCount: 3,
  basicSkillIds: [],
  mandatoryTrainingIds: [],
  isCertificationPartial: false,
  candidacyFinancingMethodIds: [],
};

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

test("AAP should not be able to submit a training form if its status is in 'PROJET'", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      status: "PROJET",
      candidacyStatuses: {
        deleteMany: {},
        createMany: { data: [{ status: "PROJET", isActive: true }] },
      },
    },
  });

  logger.info({ candidacy });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionnaireMaisonMereAAP1.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: basicTrainingForm,
      },
      returnFields: "{id}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Ce parcours ne peut pas être envoyé car la candidature n'est pas encore prise en charge.",
  );
});

test("AAP should be able to submit a basic training form when candidacy status is 'PRISE_EN_CHARGE'", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      status: "PRISE_EN_CHARGE",
      candidacyStatuses: {
        deleteMany: {},
        createMany: {
          data: [
            { status: "PROJET", isActive: false },
            { status: "VALIDATION", isActive: false },
            { status: "PRISE_EN_CHARGE", isActive: true },
          ],
        },
      },
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionnaireMaisonMereAAP1.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: basicTrainingForm,
      },
      returnFields: "{id,status}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().data.training_submitTrainingForm).toMatchObject({
    status: "PARCOURS_ENVOYE",
  });
});
