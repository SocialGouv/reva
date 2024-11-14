/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { StatutValidationInformationsJuridiquesMaisonMereAAP } from ".prisma/client";
import { prismaClient } from "../../../prisma/client";
import {
  ACCOUNT_MAISON_MERE_A_METTRE_A_JOUR,
  ACCOUNT_MAISON_MERE_EXPERT_FILIERE,
  MAISON_MERE_AAP_A_METTRE_A_JOUR,
  MAISON_MERE_AAP_EXPERT_FILIERE,
  ORGANISM_EXPERT_BRANCHE,
  ORGANISM_EXPERT_FILIERE,
} from "../../../test/fixtures";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import {
  createExpertBrancheOrganism,
  createExpertFiliereOrganism,
  createMaisonMereAAPAMettreAJour,
  createMaisonMereExpertFiliere,
} from "../../../test/helpers/create-db-entity";
import { injectGraphql } from "../../../test/helpers/graphql-helper";

const injectGraphqlGetMaisonMereAAPs = async ({
  searchFilter,
  legalValidationStatus,
}: {
  searchFilter: string;
  legalValidationStatus?: StatutValidationInformationsJuridiquesMaisonMereAAP;
}) => {
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
        ...(legalValidationStatus && { legalValidationStatus }),
      },
      enumFields: ["legalValidationStatus"],
      returnFields: "{ rows { id } info { totalRows totalPages currentPage }}",
    },
  });
};

beforeAll(async () => {
  await createMaisonMereExpertFiliere();
  await createMaisonMereAAPAMettreAJour();

  await createExpertBrancheOrganism();
  await createExpertFiliereOrganism();

  await prismaClient.maisonMereAAP.update({
    where: { id: MAISON_MERE_AAP_A_METTRE_A_JOUR.id },
    data: {
      organismes: {
        connect: [
          { id: ORGANISM_EXPERT_BRANCHE.id },
          { id: ORGANISM_EXPERT_FILIERE.id },
        ],
      },
    },
  });
});

test("find maison mere by its siret number", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: MAISON_MERE_AAP_A_METTRE_A_JOUR.siret,
  });

  expect(response.json()).not.toHaveProperty("errors");
  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: MAISON_MERE_AAP_A_METTRE_A_JOUR.id },
  ]);
});

test("find maison mere by some unordered key words from its raison social", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: MAISON_MERE_AAP_A_METTRE_A_JOUR.raisonSociale,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: MAISON_MERE_AAP_A_METTRE_A_JOUR.id },
  ]);
});

test("find maison mere by admin email", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: ACCOUNT_MAISON_MERE_EXPERT_FILIERE.email,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: MAISON_MERE_AAP_EXPERT_FILIERE.id },
  ]);
});

test("find maison mere by collaborateur email", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: ACCOUNT_MAISON_MERE_A_METTRE_A_JOUR.email,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: MAISON_MERE_AAP_A_METTRE_A_JOUR.id },
  ]);
});

test("find maison mere by text filters and legal validation status", async () => {
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: MAISON_MERE_AAP_A_METTRE_A_JOUR.raisonSociale,
    legalValidationStatus:
      StatutValidationInformationsJuridiquesMaisonMereAAP.A_JOUR,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject(
    [],
  );

  const response2 = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: MAISON_MERE_AAP_A_METTRE_A_JOUR.raisonSociale,
    legalValidationStatus:
      MAISON_MERE_AAP_A_METTRE_A_JOUR.statutValidationInformationsJuridiquesMaisonMereAAP,
  });

  expect(response2.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: MAISON_MERE_AAP_A_METTRE_A_JOUR.id },
  ]);
});
