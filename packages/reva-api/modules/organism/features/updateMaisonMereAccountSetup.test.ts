/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Account, MaisonMereAAP } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import {
  createGestionaMaisonMereAapAccount1,
  createGestionaMaisonMereAapAccount2,
  createMaisonMereAAP1,
  createMaisonMereAAP2,
} from "../../../test/helpers/create-db-entity";

let account: Account,
  account2: Account,
  maisonMereAAP: MaisonMereAAP,
  maisonMereAAP2: MaisonMereAAP;

beforeAll(async () => {
  account = await createGestionaMaisonMereAapAccount1();

  account2 = await createGestionaMaisonMereAapAccount2();

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

  await prismaClient.account.delete({
    where: { id: account.id },
  });

  await prismaClient.account.delete({
    where: { id: account2.id },
  });
});

test("API should respond with error unauthorized user", async () => {
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: maisonMereAAP.id,
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
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: maisonMereAAP.id,
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
    maisonMereAAP.id,
  );
  expect(
    response.json().data.organism_updateMaisonMereAccountSetup.showAccountSetup,
  ).toBe(true);
});

test("API should let gestionnaire maison mere aap update MaisonMereAccountSetup and return data", async () => {
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: account2.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: maisonMereAAP2.id,
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
    maisonMereAAP2.id,
  );
  expect(
    response.json().data.organism_updateMaisonMereAccountSetup.showAccountSetup,
  ).toBe(true);
});

test("API should error when user is not the manager of the MaisonMereAAP", async () => {
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "organism_updateMaisonMereAccountSetup",
      arguments: {
        data: {
          maisonMereAAPId: maisonMereAAP2.id,
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
