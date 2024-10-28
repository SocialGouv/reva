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
import { CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID } from "../../referential/referential.types";
import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";

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
  await clearDatabase();
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

test("AAP should be able to submit a basic training form when candidacy status is 'PRISE_EN_CHARGE' and its finance module is 'unifvae'", async () => {
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

test("AAP should not be able to submit a basic training form without at least one financing method  when candidacy financeModule is 'hors_plateforme'", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      status: "PRISE_EN_CHARGE",
      financeModule: "hors_plateforme",
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
  expect(resp.json().errors?.[0].message).toEqual(
    "Au moins une modalité de financement doit être renseignée",
  );
});

test("AAP should not be able to submit a basic training form without a text when the 'other source' financing method has been checked", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      status: "PRISE_EN_CHARGE",
      financeModule: "hors_plateforme",
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
        training: {
          ...basicTrainingForm,
          candidacyFinancingMethodIds: [
            CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID,
          ],
        },
      },
      returnFields: "{id,status}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Un motif doit être renseigné quand la modalité de financement 'Autre source de financement' est cochée",
  );
});

test("AAP should be able to submit a basic training form when candidacy status is 'PRISE_EN_CHARGE' and its finance module is 'hors_plateforme'", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      status: "PRISE_EN_CHARGE",
      financeModule: "hors_plateforme",
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
        training: {
          ...basicTrainingForm,
          candidacyFinancingMethodIds: [
            CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID,
          ],
          candidacyFinancingMethodOtherSourceText: "My other source text",
        },
      },
      returnFields: "{id,status}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().data.training_submitTrainingForm).toMatchObject({
    status: "PARCOURS_ENVOYE",
  });
});
