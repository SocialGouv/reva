import { Prisma } from "@prisma/client";

import * as IAM from "@/modules/account/features/keycloak";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const subRequest = {
  id: "e9d5ddcf-fea3-4801-b25b-b79f1e0b7d65",
  accountEmail: "toto@toto.mail",
  accountFirstname: "firstname",
  accountLastname: "lastname",
  companyLegalStatus: "ASSOCIATION_LOI_1901",
  companySiret: "siret",
  companyName: "name",
  managerFirstname: "fname",
  managerLastname: "lname",
  accountPhoneNumber: "phone",
  companyWebsite: "cws",
  delegataire: true,
  attestationURSSAFFile: {
    create: {
      name: "attestationurssaffile",
      path: "attestationurssafpath",
      mimeType: "attestationurssafmimetype",
    },
  },
  justificatifIdentiteDirigeantFile: {
    create: {
      name: "jidfile",
      path: "jidpath",
      mimeType: "jidmimetype",
    },
  },
} satisfies Prisma.SubscriptionRequestCreateInput;

const cgu = {
  id: "2d761888-390c-47c1-909a-d88bc9b97878",
  version: 1,
  createdAt: new Date(2021, 1, 1),
} as Prisma.ProfessionalCguCreateInput;

test("It should validate a correct subscription request", async () => {
  vi.spyOn(IAM, "getAccount").mockImplementation(() => Promise.resolve(null));

  vi.spyOn(IAM, "createAccount").mockImplementation(() =>
    Promise.resolve("ab3c88f8-87d0-4757-a5bd-f26ace8d2baf"),
  );

  await prismaClient.professionalCgu.create({ data: cgu });
  await prismaClient.subscriptionRequest.create({
    data: subRequest,
  });

  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_validateSubscriptionRequest",
      arguments: {
        subscriptionRequestId: "e9d5ddcf-fea3-4801-b25b-b79f1e0b7d65",
      },
      returnFields: "",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const result = resp.json();
  expect(result).not.toHaveProperty("errors");

  expect(result).toMatchObject({
    data: { subscription_validateSubscriptionRequest: "Ok" },
  });

  //A new Maison mere should have been created
  const maisonMereAAP = await prismaClient.maisonMereAAP.findFirst({
    where: { siret: subRequest.companySiret },
  });

  expect(maisonMereAAP).toMatchObject({
    raisonSociale: subRequest.companyName,
    siret: subRequest.companySiret,
    statutJuridique: subRequest.companyLegalStatus,
    isActive: true,
    typologie: "expertFiliere",
  });

  // A new organism should have been created
  const organism = await prismaClient.organism.findFirst({
    where: { siret: subRequest.companySiret },
  });
  expect(organism).toMatchObject({
    label: subRequest.companyName,
    legalStatus: subRequest.companyLegalStatus,
    contactAdministrativeEmail: subRequest.accountEmail,
    typology: "expertFiliere",
  });

  // The subscription should no longer exist and have no remaining relations
  const sub = await prismaClient.subscriptionRequest.findUnique({
    where: { id: subRequest.id },
  });
  expect(sub).toBeNull();
});

test("It should fail to validate the subscription request if a keycloak account with the same email already exists", async () => {
  const existingKeycloakAccountId = "d11ca98b-7ff3-4d73-aea0-d8e329980d32";
  vi.spyOn(IAM, "getAccount").mockImplementation(() =>
    Promise.resolve({ id: existingKeycloakAccountId }),
  );

  await prismaClient.professionalCgu.create({ data: cgu });
  await prismaClient.subscriptionRequest.create({
    data: subRequest,
  });

  const resp = await injectGraphql({
    fastify: global.testApp,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_validateSubscriptionRequest",
      arguments: {
        subscriptionRequestId: "e9d5ddcf-fea3-4801-b25b-b79f1e0b7d65",
      },
      returnFields: "",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const result = resp.json();
  expect(result).toHaveProperty("errors");
  expect(result.errors[0].message).toBe(
    "Cette adresse électronique est déjà associée à un compte. L'AAP doit utiliser une adresse électronique différente pour créer un compte.",
  );
});
