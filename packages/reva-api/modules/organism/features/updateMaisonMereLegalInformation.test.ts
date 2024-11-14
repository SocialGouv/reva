import { buildApp } from "../../../infra/server/app";
import keycloakPluginMock from "../../../test/mocks/keycloak-plugin.mock";
import * as updateAccount from "../../account/features/updateAccount";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import {
  createGestionnaireMaisonMereAapAccount2,
  createMaisonMereAAP2,
  createMaisonMereExpertFiliere,
} from "../../../test/helpers/create-db-entity";
import {
  GraphqlRequestDefinition,
  injectGraphql,
} from "../../../test/helpers/graphql-helper";

import { Account } from "@prisma/client";
import {
  ACCOUNT_MAISON_MERE_EXPERT_FILIERE,
  MAISON_MERE_AAP_A_METTRE_A_JOUR,
  MAISON_MERE_AAP_EXPERT_FILIERE,
} from "../../../test/fixtures";

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
      maisonMereAAPId: MAISON_MERE_AAP_EXPERT_FILIERE.id,
      ...newMaisonMereAAP1Data(siret),
    },
  },
  enumFields: ["statutJuridique"],
  returnFields: "",
});

beforeAll(async () => {
  const app = await buildApp({ keycloakPluginMock });
  (global as any).fastify = app;

  await createGestionnaireMaisonMereAapAccount2();
  await createMaisonMereExpertFiliere();
  await createMaisonMereAAP2();
});

test("should not allow a gestionnaire to update maison mere legal information", async () => {
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: ACCOUNT_MAISON_MERE_EXPERT_FILIERE.keycloakId,
    }),
    payload: updateMaisonMereLegalInformationPayload(
      MAISON_MERE_AAP_EXPERT_FILIERE.siret,
    ),
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
    payload: updateMaisonMereLegalInformationPayload(
      MAISON_MERE_AAP_EXPERT_FILIERE.siret,
    ),
  });

  expect(response.json()).not.toHaveProperty("errors");

  const updatedMaisonMere = await prismaClient.maisonMereAAP.findUnique({
    where: { id: MAISON_MERE_AAP_EXPERT_FILIERE.id },
    include: { gestionnaire: true },
  });

  const newMaisonMere = newMaisonMereAAP1Data(
    MAISON_MERE_AAP_EXPERT_FILIERE.siret,
  );

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
      keycloakId: ACCOUNT_MAISON_MERE_EXPERT_FILIERE.keycloakId,
    }),
    payload: updateMaisonMereLegalInformationPayload(
      MAISON_MERE_AAP_A_METTRE_A_JOUR.siret,
    ),
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().errors[0].message).toContain("SIRET");
});
