/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import {
  createCandidacyUnifvae,
  createCandidateMan,
  createExpertBrancheOrganism,
  createExpertFiliereOrganism,
} from "../../../test/helpers/create-db-entity";
import { injectGraphql } from "../../../test/helpers/graphql-helper";

import { CandidacyStatusStep } from "@prisma/client";
import {
  ACCOUNT_ORGANISM_EXPERT_FILIERE,
  CANDIDACY_UNIFVAE,
  CANDIDATE_MAN,
  ORGANISM_EXPERT_BRANCHE,
  TRAINING_INPUT,
} from "../../../test/fixtures";
import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";

const selectNewOrganism = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: CANDIDATE_MAN.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_selectOrganism",
      arguments: {
        candidacyId: CANDIDACY_UNIFVAE.id,
        organismId: ORGANISM_EXPERT_BRANCHE.id,
      },
      returnFields: "{id,organismId}",
    },
  });

const submitTraining = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: ACCOUNT_ORGANISM_EXPERT_FILIERE.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: CANDIDACY_UNIFVAE.id,
        training: TRAINING_INPUT,
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

beforeEach(async () => {
  await createExpertFiliereOrganism();
  await createExpertBrancheOrganism();
  await createCandidateMan();
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

test("a candidate should be able to select a new organism while a training is sent", async () => {
  await submitTraining();
  const resp = await selectNewOrganism();

  expect(resp.statusCode).toEqual(200);
  expect(resp.json().data.candidacy_selectOrganism).toMatchObject({
    id: CANDIDACY_UNIFVAE.id,
    organismId: ORGANISM_EXPERT_BRANCHE.id,
  });
});

test("a candidate should not be able to select a new organism after the training is confirmed", async () => {
  await submitTraining();
  await confirmTraining();
  const resp = await selectNewOrganism();

  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Impossible de changer d'organisme d'accompagnement après avoir confirmé le parcours",
  );
});

test("should reset the status to validation when selecting a new organism and status is prise_en_charge", async () => {
  await selectNewOrganism();

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: CANDIDACY_UNIFVAE.id },
  });

  expect(candidacy).toMatchObject({
    status: CandidacyStatusStep.VALIDATION,
  });
});

test("should reset the training and update the status when selecting a new organism", async () => {
  await submitTraining();
  await selectNewOrganism();

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
    status: CandidacyStatusStep.VALIDATION,
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