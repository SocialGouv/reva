import keycloakPluginMock from "../../../test/mocks/keycloak-plugin.mock";
import { buildApp } from "../../../infra/server/app";
import * as updateAccount from "../../account/features/updateAccount";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import {
  GraphqlRequestDefinition,
  injectGraphql,
} from "../../../test/helpers/graphql-helper";
import {
  createGestionnaireMaisonMereAapAccount1,
  createGestionnaireMaisonMereAapAccount2,
  createMaisonMereAAP1,
  createMaisonMereAAP2,
} from "../../../test/helpers/create-db-entity";

import {
  gestionnaireMaisonMereAAP1,
  maisonMereAAP1,
  maisonMereAAP2,
} from "../../../test/fixtures/people-organisms";
import { Account } from "@prisma/client";

const newMaisonMereAAP1Data = (siret: string) => ({
  raisonSociale: "Nouvelle raison sociale",
  siret,
  statutJuridique: "SARL",
  managerFirstname: "John",
  managerLastname: "Doe",
  gestionnaireFirstname: "Jane",
  gestionnaireLastname: "Smith",
  gestionnaireEmail: "jane.smith@example.com",
  phone: "0123456789",
});

const updateMaisonMereLegalInformationPayload: (
  siret: string,
) => GraphqlRequestDefinition = (siret: string) => ({
  requestType: "mutation",
  endpoint: "organism_updateMaisonMereLegalInformation",
  arguments: {
    data: {
      maisonMereAAPId: maisonMereAAP1.id,
      ...newMaisonMereAAP1Data(siret),
    },
  },
  enumFields: ["statutJuridique"],
  returnFields: "",
});

beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;

  await createGestionnaireMaisonMereAapAccount1();
  await createGestionnaireMaisonMereAapAccount2();
  await createMaisonMereAAP1();
  await createMaisonMereAAP2();
});

afterAll(async () => {
  await prismaClient.maisonMereAAP.deleteMany({
    where: { id: { in: [maisonMereAAP1.id, maisonMereAAP2.id] } },
  });

  await prismaClient.account.deleteMany({
    where: { id: gestionnaireMaisonMereAAP1.id },
  });
});

test("should not allow a gestionnaire to update maison mere legal information", async () => {
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: gestionnaireMaisonMereAAP1.keycloakId,
    }),
    payload: updateMaisonMereLegalInformationPayload(maisonMereAAP1.siret),
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().errors[0].message).toMatch("You are not authorized");
});

test("should allow admin to update maison mere legal information", async () => {
  jest
    .spyOn(updateAccount, "updateAccountById")
    .mockImplementation(() => Promise.resolve({} as Account));

  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "uuid",
    }),
    payload: updateMaisonMereLegalInformationPayload(maisonMereAAP1.siret),
  });

  expect(response.json()).not.toHaveProperty("errors");

  const updatedMaisonMere = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAP1.id },
    include: { gestionnaire: true },
  });

  const newMaisonMere = newMaisonMereAAP1Data(maisonMereAAP1.siret);

  expect(updatedMaisonMere).toMatchObject({
    raisonSociale: newMaisonMere.raisonSociale,
    siret: newMaisonMere.siret,
    statutJuridique: newMaisonMere.statutJuridique,
    managerFirstname: newMaisonMere.managerFirstname,
    managerLastname: newMaisonMere.managerLastname,
    phone: newMaisonMere.phone,
  });
});

test("should error when SIRET is already used by another structure", async () => {
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: gestionnaireMaisonMereAAP1.keycloakId,
    }),
    payload: updateMaisonMereLegalInformationPayload(maisonMereAAP2.siret),
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().errors[0].message).toContain("SIRET");
});
