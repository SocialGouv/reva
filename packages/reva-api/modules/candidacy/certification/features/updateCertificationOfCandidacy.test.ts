/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { prismaClient } from "../../../../prisma/client";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertBrancheOrganism,
  createExpertFiliereOrganism,
} from "../../../../test/helpers/create-db-entity";
import {
  candidateJPL,
  gestionnaireMaisonMereAAP1,
} from "../../../../test/fixtures/people-organisms";

import { clearDatabase } from "../../../../test/jestClearDatabaseBeforeEachTestFile";
import { certificationId2FromSeed } from "../../../../test/fixtures/candidacy";
import { basicTrainingForm } from "../../../../test/fixtures/training";
import { Candidacy } from "@prisma/client";

let candidacyUnifvae: Candidacy;

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

const updateCertification = async () =>
  await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateJPL.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_certification_updateCertification",
      arguments: {
        candidacyId: candidacyUnifvae.id,
        departmentId: candidacyUnifvae.departmentId,
        certificationId: certificationId2FromSeed,
      },
      returnFields: "",
    },
  });

beforeEach(async () => {
  await createExpertFiliereOrganism();
  await createExpertBrancheOrganism();
  await createCandidateJPL();
  candidacyUnifvae = await createCandidacyUnifvae();

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

test("a candidate should be able to select a new certification while a training is sent", async () => {
  await submitTraining();
  await updateCertification();

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyUnifvae.id },
  });

  expect(candidacy?.certificationId).toEqual(certificationId2FromSeed);
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
