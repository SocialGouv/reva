/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import {
  createAgencePrincipaleMaisonMere2,
  createCollaborateurMaisonMereAAP2,
  createGestionaMaisonMereAapAccount1,
  createGestionaMaisonMereAapAccount2,
  createLieuAccueilMaisonMere2,
  createMaisonMereAAP1,
  createMaisonMereAAP2,
} from "../../../test/helpers/create-db-entity";
import {
  agencePrincipaleMaisonMere2,
  collaborateurMaisonMereAapAccount2,
  gestionaMaisonMereAapAccount1,
  gestionaMaisonMereAapAccount2,
  lieuAccueilMaisonMere2,
  maisonMereAAP1,
  maisonMereAAP2,
} from "../../../test/fixtures/people-organisms";

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

beforeAll(async () => {
  await createGestionaMaisonMereAapAccount1();
  await createGestionaMaisonMereAapAccount2();

  await createMaisonMereAAP1();
  await createMaisonMereAAP2();

  await createAgencePrincipaleMaisonMere2();
  await createLieuAccueilMaisonMere2();

  await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAP2.id },
    data: {
      organismes: {
        connect: [
          { id: agencePrincipaleMaisonMere2.id },
          { id: lieuAccueilMaisonMere2.id },
        ],
      },
    },
  });

  await createCollaborateurMaisonMereAAP2();
});

afterAll(async () => {
  await prismaClient.maisonMereAAP.delete({
    where: { id: maisonMereAAP1.id },
  });

  await prismaClient.organism.delete({
    where: { id: agencePrincipaleMaisonMere2.id },
  });

  await prismaClient.organism.delete({
    where: { id: lieuAccueilMaisonMere2.id },
  });

  await prismaClient.maisonMereAAP.delete({
    where: { id: maisonMereAAP2.id },
  });

  await prismaClient.account.delete({
    where: { id: collaborateurMaisonMereAapAccount2.id },
  });

  await prismaClient.account.delete({
    where: { id: gestionaMaisonMereAapAccount1.id },
  });

  await prismaClient.account.delete({
    where: { id: gestionaMaisonMereAapAccount2.id },
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

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: maisonMereAAP2.id },
  ]);
});

test("find maison mere by admin email", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs(
    gestionaMaisonMereAapAccount1.email,
  );

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: maisonMereAAP1.id },
  ]);
});

test("find maison mere by collaborateur email", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs(
    collaborateurMaisonMereAapAccount2.email,
  );

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: maisonMereAAP2.id },
  ]);
});
