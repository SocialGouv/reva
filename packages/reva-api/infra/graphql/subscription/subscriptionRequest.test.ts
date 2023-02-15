/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { LegalStatus } from "@prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { prismaClient } from "../../database/postgres/client";

const subreqSample = {
  companyName: "Jojo formation",
  companyLegalStatus: LegalStatus.SAS,
  companySiret: "1234888",
  companyAddress: "64 boulevard du Général Leclerc 35600 Fougères",
  companyBillingAddress: "123 rue Tabaga 75015 Paris",
  companyBic: "1232131",
  companyIban: "234345343",
  companyBillingEmail: "billing@jojo-formation.fr",
  accountFirstname: "Jojo",
  accountLastname: "Landouille",
  accountPhoneNumber: "03214556789",
  accountEmail: "contact@jojo-formation.fr",
};

let subreq1Id: string, subreq2Id: string;

beforeAll(async () => {
  const subreq = await prismaClient.subscriptionRequest.create({
    data: subreqSample,
  });
  subreq2Id = subreq.id;
});

afterAll(async () => {
  await prismaClient.subscriptionRequest.deleteMany({
    where: {
      id: { in: [subreq1Id, subreq2Id] },
    },
  });
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
      arguments: { subscriptionRequest: subreqSample },
      enumFields: ["companyLegalStatus"],
      returnFields:
        "{ id, accountEmail, accountFirstname, accountLastname, accountPhoneNumber, companyAddress, companyBic, companyBillingAddress, companyBillingEmail, companyIban, companyLegalStatus, companyName, companySiret }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const subreq = resp.json().data.subscription_createSubscriptionRequest;
  subreq1Id = subreq.id;
  expect(subreq).toMatchObject(subreqSample);
});

// test("Should fail when auhtentified as manager", async () => {
//   const resp = await injectGraphql({
//     fastify: (global as any).fastify,
//     authorization: authorizationHeaderForUser({
//       role: "manage_candidacy",
//       keycloakId: "blabla",
//     }),
//     payload: {
//       requestType: "mutation",
//       endpoint: "subscription_createSubscriptionRequest",
//       arguments: { subscriptionRequest: subreqSample },
//       enumFields: ["companyLegalStatus"],
//       returnFields: "{ id }",
//     },
//   });
//   expect(resp.statusCode).toEqual(400);
// });

// test("Should fail when auhtentified as admin", async () => {
//   const resp = await injectGraphql({
//     fastify: (global as any).fastify,
//     authorization: authorizationHeaderForUser({
//       role: "admin",
//       keycloakId: "blabla",
//     }),
//     payload: {
//       requestType: "mutation",
//       endpoint: "subscription_createSubscriptionRequest",
//       arguments: { subscriptionRequest: subreqSample },
//       enumFields: ["companyLegalStatus"],
//       returnFields: "{ id }",
//     },
//   });
//   expect(resp.statusCode).toEqual(400);
// });
