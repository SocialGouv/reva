/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { MaisonMereAAP } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import {
  createGestionaMaisonMereAapAccount1,
  createGestionaMaisonMereAapAccount2,
  createMaisonMereAAP1,
  createMaisonMereAAP2,
} from "../../../test/helpers/create-db-entity";

const injectGraphqlGetMaisonMereAAPs = async (searchFilter: string) => {
  return injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "query",
      endpoint: "organism_getMaisonMereAAPs",
      arguments: {
        offset: 0,
        searchFilter,
      },
      returnFields: "{ rows { id } info { totalRows totalPages currentPage }}",
    },
  });
};

let maisonMereAAP: MaisonMereAAP, maisonMereAAP2: MaisonMereAAP;

beforeAll(async () => {
  await createGestionaMaisonMereAapAccount1();
  await createGestionaMaisonMereAapAccount2();
  maisonMereAAP = await createMaisonMereAAP1();
  maisonMereAAP2 = await createMaisonMereAAP2();
});

afterAll(async () => {
  await prismaClient.maisonMereAAP.delete({
    where: { id: maisonMereAAP.id },
  });

  await prismaClient.maisonMereAAP.delete({
    where: { id: maisonMereAAP2.id },
  });
});

test("find maison mere by its siret number", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs(maisonMereAAP2.siret);

  expect(response.json()).not.toHaveProperty("errors");
  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: maisonMereAAP2.id },
  ]);
});

test("find maison mere by some unordered key words from its raison social", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs(
    "organism2 mere maison",
  );

  expect(response.json()).not.toHaveProperty("errors");
  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: maisonMereAAP2.id },
  ]);
});
