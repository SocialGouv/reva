/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { Candidacy } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { CANDIDATE_MAN } from "../../test/fixtures";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import {
  createCandidacyUnifvae,
  createCandidateJPL,
  createExpertFiliereOrganism,
  createGestionnaireMaisonMereAapAccount1,
} from "../../test/helpers/create-db-entity";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";

let candidacy: Candidacy;

beforeEach(async () => {
  await createGestionnaireMaisonMereAapAccount1();
  await createExpertFiliereOrganism();
  await createCandidateJPL();
  candidacy = await createCandidacyUnifvae();
});

afterEach(async () => {
  await clearDatabase();
});

test("candidate should be able to change it's type_accompagnement when the candidacy is still in project", async () => {
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      status: "PROJET",
      candidacyStatuses: {
        deleteMany: {},
        createMany: {
          data: [{ status: "PROJET", isActive: true }],
        },
      },
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: CANDIDATE_MAN.keycloakId,
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
    data: {
      status: "VALIDATION",
      candidacyStatuses: {
        deleteMany: {},
        createMany: {
          data: [
            { status: "PROJET", isActive: false },
            { status: "VALIDATION", isActive: true },
          ],
        },
      },
    },
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: CANDIDATE_MAN.keycloakId,
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
