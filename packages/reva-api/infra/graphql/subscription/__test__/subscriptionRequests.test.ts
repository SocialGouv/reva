/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { FunctionalCodeError } from "../../../../domain/types/functionalError";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";
import { subreqSampleMin } from "./fixture";

const subreqSampleFull = Object.assign(
  { typology: "generaliste" as const },
  subreqSampleMin,
  {
    companyAddress: "64 boulevard du Général Leclerc",
    companyZipCode: "35660",
    companyCity: "Fougères",
  }
);

let onSiteDepartmentsIds: string[], remoteDepartmentsIds: string[];

beforeAll(async () => {
  const ileDeFrance = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  const loireAtlantique = await prismaClient.department.findFirst({
    where: { code: "44" },
  });

  onSiteDepartmentsIds = [ileDeFrance?.id || ""];
  remoteDepartmentsIds = [ileDeFrance?.id || "", loireAtlantique?.id || ""];

  await prismaClient.organism.deleteMany({});
});

afterAll(async () => {
  await prismaClient.subscriptionRequest.deleteMany({});
});

test("Should fail to create a subscription request with missing address fields", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_createSubscriptionRequest",
      arguments: { subscriptionRequest: subreqSampleMin },
      enumFields: ["companyLegalStatus"],
      returnFields:
        "{ id, companySiret, companyLegalStatus, companyName, companyAddress, companyZipCode, companyCity, accountFirstname, accountLastname, accountEmail, accountPhoneNumber }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const data = resp.json();
  expect(data).toHaveProperty("errors");
});

test("Should fail to create a subscription request when matching existing organism based on siret/typology", async () => {
  const sameOrganism = await prismaClient.organism.create({
    data: {
      siret: subreqSampleFull.companySiret,
      typology: subreqSampleFull.typology,
      contactAdministrativeEmail: subreqSampleFull.accountEmail,
      label: "beautiful SA",
      address: "123 mean street",
      city: "boom",
      zip: "12345",
    },
  });
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_createSubscriptionRequest",
      arguments: {
        subscriptionRequest: {
          ...subreqSampleFull,
          onSiteDepartmentsIds,
          remoteDepartmentsIds,
        },
      },
      enumFields: ["companyLegalStatus", "typology"],
      returnFields:
        "{ id, companySiret, companyLegalStatus, companyName, companyAddress, companyZipCode, companyCity, accountFirstname, accountLastname, accountEmail, accountPhoneNumber, qualiopiCertificateExpiresAt }",
    },
  });
  await prismaClient.organism.delete({
    where: {
      id: sameOrganism.id,
    },
  });
  expect(resp.statusCode).toEqual(200);
  const data = resp.json();
  expect(data).toHaveProperty("errors");
  expect(data.errors[0].extensions.code).toBe(
    FunctionalCodeError.SUBSCRIPTION_REQUEST_HAS_MATCHING_ORGANISM
  );
});

test("Should fail to create a similar subscription request based on siret/typology", async () => {
  await prismaClient.subscriptionRequest.create({
    data: subreqSampleFull,
  });

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_createSubscriptionRequest",
      arguments: {
        subscriptionRequest: {
          ...subreqSampleFull,
          onSiteDepartmentsIds,
          remoteDepartmentsIds,
        },
      },
      enumFields: ["companyLegalStatus", "typology"],
      returnFields:
        "{ id, companySiret, companyLegalStatus, companyName, companyAddress, companyZipCode, companyCity, accountFirstname, accountLastname, accountEmail, accountPhoneNumber, qualiopiCertificateExpiresAt }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const data = resp.json();
  expect(data).toHaveProperty("errors");
  expect(data.errors[0].extensions.code).toBe(
    FunctionalCodeError.SUBSCRIPTION_REQUEST_ALREADY_EXISTS
  );
});

test("Should create a subscription request", async () => {
  const successfulSubReq = {
    ...subreqSampleFull,
    companySiret: "01234567891234",
    typology: "expertBranche",
  };
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_createSubscriptionRequest",
      arguments: {
        subscriptionRequest: {
          ...successfulSubReq,
          onSiteDepartmentsIds,
          remoteDepartmentsIds,
        },
      },
      enumFields: ["companyLegalStatus", "typology"],
      returnFields:
        "{ id, companySiret, companyLegalStatus, companyName, companyAddress, companyZipCode, companyCity, accountFirstname, accountLastname, accountEmail, accountPhoneNumber, qualiopiCertificateExpiresAt }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).not.toHaveProperty("errors");
  const subreq = resp.json().data.subscription_createSubscriptionRequest;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { typology, ...subRequestWithoutTypology } = successfulSubReq;
  expect(subreq).toMatchObject({
    ...subRequestWithoutTypology,
    qualiopiCertificateExpiresAt: 5427820800000,
  });
});
