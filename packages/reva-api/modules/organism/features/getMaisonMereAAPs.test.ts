/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { StatutValidationInformationsJuridiquesMaisonMereAAP } from ".prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createMaisonMereAapHelper } from "../../../test/helpers/entities/create-maison-mere-aap-helper";
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

test("find maison mere by its siret number", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: mmAap.siret,
  });

  expect(response.json()).not.toHaveProperty("errors");
  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: mmAap.id },
  ]);
});

test("find maison mere by some unordered key words from its raison social", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: mmAap.raisonSociale,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: mmAap.id },
  ]);
});

test("find maison mere by admin email", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: mmAap.gestionnaire.email,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: mmAap.id },
  ]);
});

test("find maison mere by collaborateur email", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: mmAap.gestionnaire.email,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: mmAap.id },
  ]);
});

test("find maison mere by text filters and legal validation status", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: mmAap.raisonSociale,
    legalValidationStatus:
      StatutValidationInformationsJuridiquesMaisonMereAAP.A_JOUR,
  });

  expect(response.json().data.organism_getMaisonMereAAPs.rows).toMatchObject(
    [],
  );

  const response2 = await injectGraphqlGetMaisonMereAAPs({
    searchFilter: mmAap.raisonSociale,
    legalValidationStatus:
      mmAap.statutValidationInformationsJuridiquesMaisonMereAAP,
  });

  expect(response2.json().data.organism_getMaisonMereAAPs.rows).toMatchObject([
    { id: mmAap.id },
  ]);
});
