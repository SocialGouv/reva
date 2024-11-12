/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertBrancheOrganism,
  createExpertFiliereOrganism,
} from "../../../test/helpers/create-db-entity";
import {
  candidateJPL,
  expertBrancheOrganism,
  gestionnaireMaisonMereAAP1,
} from "../../../test/fixtures/people-organisms";

import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";
import { candidacyUnifvae } from "../../../test/fixtures/candidacy";
import { basicTrainingForm } from "../../../test/fixtures/training";
import { CandidacyStatusStep } from "@prisma/client";

const selectNewOrganism = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateJPL.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_selectOrganism",
      arguments: {
        candidacyId: candidacyUnifvae.id,
        organismId: expertBrancheOrganism.id,
      },
      returnFields: "{id,organismId}",
    },
  });

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
        candidacyId: candidacyUnifvae.id,
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
      keycloakId: candidateJPL.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_confirmTrainingForm",
      arguments: {
        candidacyId: candidacyUnifvae.id,
      },
      returnFields: "{id, status}",
    },
  });

beforeEach(async () => {
  await createExpertFiliereOrganism();
  await createExpertBrancheOrganism();
  await createCandidateJPL();
  await createCandidacyUnifvae();

  await prismaClient.candidacy.update({
    where: { id: candidacyUnifvae.id },
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
    id: candidacyUnifvae.id,
    organismId: expertBrancheOrganism.id,
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
    where: { id: candidacyUnifvae.id },
  });

  expect(candidacy).toMatchObject({
    status: CandidacyStatusStep.VALIDATION,
  });
});

test("should reset the training and update the status when selecting a new organism", async () => {
  await submitTraining();
  await selectNewOrganism();

  const candidacyId = candidacyUnifvae.id;
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
