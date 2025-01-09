/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep } from "@prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";

afterEach(async () => {
  await clearDatabase();
});

test.each([
  "PROJET",
  "VALIDATION",
  "PRISE_EN_CHARGE",
  "PARCOURS_ENVOYE",
] satisfies CandidacyStatusStep[])(
  "candidate should be able to change it's type_accompagnement to 'autonome' when the candidacy status is '%s'",
  async (status) => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: status,
      candidacyArgs: { typeAccompagnement: "ACCOMPAGNE" },
    });
    const candidateKeycloakId = candidacy.candidate?.keycloakId;

    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidateKeycloakId,
      }),
      payload: {
        requestType: "mutation",
        endpoint: "candidacy_updateTypeAccompagnement",
        arguments: {
          candidacyId: candidacy.id,
          typeAccompagnement: "AUTONOME",
        },
        returnFields: "{id,typeAccompagnement}",
        enumFields: ["typeAccompagnement"],
      },
    });
    expect(resp.statusCode).toEqual(200);
    const obj = resp.json();
    expect(obj.data.candidacy_updateTypeAccompagnement).toMatchObject({
      typeAccompagnement: "AUTONOME",
    });
  },
);

test("candidate should NOT be able to change it's type_accompagnement to 'autonome' when the candidacy status is equal to 'PARCOURS_CONFIRME'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.PARCOURS_CONFIRME,
    candidacyArgs: { typeAccompagnement: "ACCOMPAGNE" },
  });
  const candidateKeycloakId = candidacy.candidate?.keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateKeycloakId,
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
    "Impossible de modifier le type d'accompagnement une fois le parcours confirmé",
  );
});

test("candidate should be able to change it's type_accompagnement to 'accompagne' when the candidacy status is 'PROJET'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "PROJET",
    candidacyArgs: { typeAccompagnement: "AUTONOME" },
  });
  const candidateKeycloakId = candidacy.candidate?.keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateTypeAccompagnement",
      arguments: {
        candidacyId: candidacy.id,
        typeAccompagnement: "ACCOMPAGNE",
      },
      returnFields: "{id,typeAccompagnement}",
      enumFields: ["typeAccompagnement"],
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.candidacy_updateTypeAccompagnement).toMatchObject({
    typeAccompagnement: "ACCOMPAGNE",
  });
});

test("candidate should NOT be able to change it's type_accompagnement to 'accompagne' when the candidacy status is equal to 'DOSSIER_FAISABILITE_ENVOYE'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
    candidacyArgs: { typeAccompagnement: "AUTONOME" },
  });
  const candidateKeycloakId = candidacy.candidate?.keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: candidateKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_updateTypeAccompagnement",
      arguments: {
        candidacyId: candidacy.id,
        typeAccompagnement: "ACCOMPAGNE",
      },
      returnFields: "{id,typeAccompagnement}",
      enumFields: ["typeAccompagnement"],
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "Impossible de modifier le type d'accompagnement une fois le dossier de faisabilité envoyé",
  );
});
