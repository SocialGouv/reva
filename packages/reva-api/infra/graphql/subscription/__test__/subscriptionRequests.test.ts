/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";
import { subreqSampleMin } from "./fixture";

const subreqSampleAddress = {
  companyAddress: "64 boulevard du Général Leclerc",
  companyZipCode: "35660",
  companyCity: "Fougères",
};

const subreqSampleFull = Object.assign(
  { typology: "generaliste" as const },
  subreqSampleMin,
  subreqSampleAddress
);

let subreq1Id: string,
  onSiteDepartmentsIds: string[],
  remoteDepartmentsIds: string[];

beforeAll(async () => {
  const ileDeFrance = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  const loireAtlantique = await prismaClient.department.findFirst({
    where: { code: "44" },
  });

  onSiteDepartmentsIds = [ileDeFrance?.id || ""];
  remoteDepartmentsIds = [ileDeFrance?.id || "", loireAtlantique?.id || ""];
});

afterAll(async () => {
  await prismaClient.subscriptionRequest.deleteMany({
    where: {
      id: { in: [subreq1Id] },
    },
  });
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
  expect(resp.json()).toHaveProperty("errors");
});

test("Should create a subscription request", async () => {
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
  expect(resp.json()).not.toHaveProperty("errors");
  const subreq = resp.json().data.subscription_createSubscriptionRequest;
  subreq1Id = subreq.id;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { typology, ...subRequestWithoutTypology } = subreqSampleFull;
  expect(subreq).toMatchObject({
    ...subRequestWithoutTypology,
    qualiopiCertificateExpiresAt: 5427820800000,
  });
});
