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

test("candidate should be able to change it's type_accompagnement when the candidacy is still in project", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.PROJET,
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
  expect(obj.data.candidacy_updateTypeAccompagnement).toMatchObject({
    typeAccompagnement: "AUTONOME",
  });
});

test("candidate should NOT be able to change it's type_accompagnement when the candidacy is not in project", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.VALIDATION,
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
    "Impossible de modifier le type d'accompagnement une fois la candidature envoyée",
  );
});
