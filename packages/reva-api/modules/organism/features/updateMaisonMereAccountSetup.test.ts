import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

test("API should respond with error unauthorized user", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: mmAap.id,
          showAccountSetup: true,
        },
      },
      returnFields: "{id}",
    },
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().data.organism_updateMaisonMereAccountSetup).toBeNull();
  expect(response.json().errors[0].message).toMatch("You are not authorized");
});

test("API should let admin update MaisonMereAccountSetup and return data", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: mmAap.id,
          showAccountSetup: true,
        },
      },
      returnFields: "{id,showAccountSetup}",
    },
  });

  expect(response.json()).not.toHaveProperty("errors");
  expect(
    response.json().data.organism_updateMaisonMereAccountSetup,
  ).not.toBeNull();
  expect(response.json().data.organism_updateMaisonMereAccountSetup.id).toBe(
    mmAap.id,
  );
  expect(
    response.json().data.organism_updateMaisonMereAccountSetup.showAccountSetup,
  ).toBe(true);
});

test("API should let gestionnaire maison mere aap update MaisonMereAccountSetup and return data", async () => {
  const mmAap = await createMaisonMereAapHelper();

  const response = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: mmAap.gestionnaire.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: mmAap.id,
          showAccountSetup: true,
        },
      },
      returnFields: "{id,showAccountSetup}",
    },
  });

  expect(response.json()).not.toHaveProperty("errors");
  expect(
    response.json().data.organism_updateMaisonMereAccountSetup,
  ).not.toBeNull();
  expect(response.json().data.organism_updateMaisonMereAccountSetup.id).toBe(
    mmAap.id,
  );
  expect(
    response.json().data.organism_updateMaisonMereAccountSetup.showAccountSetup,
  ).toBe(true);
});

test("API should error when user is not the manager of the MaisonMereAAP", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: mmAap.id,
          showAccountSetup: true,
        },
      },
      returnFields: "{id,showAccountSetup}",
    },
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().data.organism_updateMaisonMereAccountSetup).toBeNull();
  expect(response.json().errors[0].message).toMatch("Vous n'êtes pas autorisé");
});
