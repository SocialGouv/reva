/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep } from "@prisma/client";
import { TRAINING_INPUT } from "../../../test/fixtures";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";
import { CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID } from "../../referential/referential.types";

afterEach(async () => {
  await clearDatabase();
});

test("AAP should not be able to submit a training form if its status is in 'PROJET'", async () => {
  const candidacy = await createCandidacyHelper({}, CandidacyStatusStep.PROJET);
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: TRAINING_INPUT,
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
  const candidacy = await createCandidacyHelper(
    {},
    CandidacyStatusStep.PRISE_EN_CHARGE,
  );
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: TRAINING_INPUT,
      },
      returnFields: "{id,status}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().data.training_submitTrainingForm).toMatchObject({
    status: "PARCOURS_ENVOYE",
  });
});

test("AAP should not be able to submit a basic training form without an estimated costwhen candidacy financeModule is 'hors_plateforme'", async () => {
  const candidacy = await createCandidacyHelper(
    {
      financeModule: "hors_plateforme",
    },
    CandidacyStatusStep.PRISE_EN_CHARGE,
  );
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: TRAINING_INPUT,
      },
      returnFields: "{id,status}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Un montant de devis doit être renseigné",
  );
});

test("AAP should not be able to submit a basic training form without at least one financing method  when candidacy financeModule is 'hors_plateforme'", async () => {
  const candidacy = await createCandidacyHelper(
    {
      financeModule: "hors_plateforme",
    },
    CandidacyStatusStep.PRISE_EN_CHARGE,
  );
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: { ...TRAINING_INPUT, estimatedCost: 1000 },
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
  const candidacy = await createCandidacyHelper(
    {
      financeModule: "hors_plateforme",
    },
    CandidacyStatusStep.PRISE_EN_CHARGE,
  );
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: {
          ...TRAINING_INPUT,
          estimatedCost: 1000,
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
  const candidacy = await createCandidacyHelper(
    {
      financeModule: "hors_plateforme",
    },
    CandidacyStatusStep.PRISE_EN_CHARGE,
  );
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: {
          ...TRAINING_INPUT,
          estimatedCost: 1000,
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
