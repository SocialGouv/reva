import * as updateAccount from "../../account/features/updateAccount";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import {
  GraphqlRequestDefinition,
  injectGraphql,
} from "../../../test/helpers/graphql-helper";

import { Account } from "@prisma/client";
import { createMaisonMereAapHelper } from "../../../test/helpers/entities/create-maison-mere-aap-helper";

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
  mmAapId: string,
) => GraphqlRequestDefinition = (siret: string, mmAapId: string) => ({
  requestType: "mutation",
  endpoint: "organism_updateMaisonMereLegalInformation",
  arguments: {
    data: {
      maisonMereAAPId: mmAapId,
      ...newMaisonMereAAP1Data(siret),
    },
  },
  enumFields: ["statutJuridique"],
  returnFields: "",
});

test("should not allow a gestionnaire to update maison mere legal information", async () => {
  const mmAap = await createMaisonMereAapHelper();
  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "gestion_maison_mere_aap",
      keycloakId: mmAap.gestionnaire.keycloakId,
    }),
    payload: updateMaisonMereLegalInformationPayload(mmAap.siret, mmAap.id),
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().errors[0].message).toMatch("You are not authorized");
});

test("should allow admin to update maison mere legal information", async () => {
  jest
    .spyOn(updateAccount, "updateAccountById")
    .mockImplementation(() => Promise.resolve({} as Account));

  const mmAap = await createMaisonMereAapHelper();

  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: updateMaisonMereLegalInformationPayload(mmAap.siret, mmAap.id),
  });

  expect(response.json()).not.toHaveProperty("errors");

  const updatedMaisonMere = await prismaClient.maisonMereAAP.findUnique({
    where: { id: mmAap.id },
    include: { gestionnaire: true },
  });

  const newMaisonMere = newMaisonMereAAP1Data(mmAap.siret);

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
  const mmAap = await createMaisonMereAapHelper();
  const mmAap2 = await createMaisonMereAapHelper();

  const response = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: mmAap.gestionnaire.keycloakId,
    }),
    payload: updateMaisonMereLegalInformationPayload(mmAap2.siret, mmAap.id),
  });

  expect(response.json()).toHaveProperty("errors");
  expect(response.json().errors[0].message).toContain("SIRET");
});
