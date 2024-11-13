/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { prismaClient } from "../../../../prisma/client";
import { gestionnaireMaisonMereAAP1 } from "../../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertBrancheOrganism,
  createExpertFiliereOrganism,
} from "../../../../test/helpers/create-db-entity";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";

import { CandidacyStatusStep } from "@prisma/client";
import { CANDIDACY_UNIFVAE, CANDIDATE_MAN } from "../../../../test/fixtures";
import { basicTrainingForm } from "../../../../test/fixtures/training";
import { clearDatabase } from "../../../../test/jestClearDatabaseBeforeEachTestFile";

const submitTraining = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionnaireMaisonMereAAP1.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: CANDIDACY_UNIFVAE.id,
        training: basicTrainingForm,
      },
      returnFields: "{id,status}",
    },
  });

const confirmTraining = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: CANDIDATE_MAN.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_confirmTrainingForm",
      arguments: {
        candidacyId: CANDIDACY_UNIFVAE.id,
      },
      returnFields: "{id, status}",
    },
  });

const updateCertification = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: CANDIDATE_MAN.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_certification_updateCertification",
      arguments: {
        candidacyId: CANDIDACY_UNIFVAE.id,
        certificationId: CANDIDACY_UNIFVAE.certificationId,
      },
      returnFields: "",
    },
  });

beforeEach(async () => {
  await createExpertFiliereOrganism();
  await createExpertBrancheOrganism();
  await createCandidateJPL();
  await createCandidacyUnifvae();

  await prismaClient.candidacy.update({
    where: { id: CANDIDACY_UNIFVAE.id },
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
});

afterEach(async () => {
  await clearDatabase();
});

test("a candidate should be able to select a new certification while a training is sent", async () => {
  await submitTraining();
  await updateCertification();

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: CANDIDACY_UNIFVAE.id },
  });

  expect(candidacy?.certificationId).toEqual(CANDIDACY_UNIFVAE.certificationId);
});

test("a candidate should not be able to select a new certification after the training is confirmed", async () => {
  await submitTraining();
  await confirmTraining();
  const resp = await updateCertification();

  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Impossible de changer de certification après avoir confirmé le parcours",
  );
});

test("should reset the training and status when selecting a new certification", async () => {
  await submitTraining();
  await updateCertification();

  const candidacyId = CANDIDACY_UNIFVAE.id;
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
  const basicSkillsCount = await prismaClient.basicSkillOnCandidacies.count({
    where: { candidacyId },
  });
  const trainingCount = await prismaClient.trainingOnCandidacies.count({
    where: { candidacyId },
  });
  const financingMethodCount =
    await prismaClient.candidacyOnCandidacyFinancingMethod.count({
      where: { candidacyId },
    });

  expect(candidacy).toMatchObject({
    status: CandidacyStatusStep.PROJET,
    certificateSkills: null,
    otherTraining: null,
    individualHourCount: null,
    collectiveHourCount: null,
    additionalHourCount: null,
    isCertificationPartial: null,
    estimatedCost: null,
  });

  expect(basicSkillsCount).toEqual(0);
  expect(trainingCount).toEqual(0);
  expect(financingMethodCount).toEqual(0);
});
