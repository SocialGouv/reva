/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { LegalStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";

const NB_SUBSCRIPTION_REQUESTS = 40;

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

beforeAll(() => {
  return prismaClient.subscriptionRequest.deleteMany()
  .then(() => createManySubscriptionRequests(NB_SUBSCRIPTION_REQUESTS));
});

afterAll(() => {
  return prismaClient.subscriptionRequest.deleteMany()
});

test("Get requests list should fail when not admin", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
    }),
    payload: {
      requestType: "query",
      endpoint: "subscription_getSubscriptionRequests",
      returnFields: "{ id }",
    },
  });
  expect(resp.statusCode).toEqual(400);
});

test("Get requests list should return paginated list", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
    }),
    payload: {
      requestType: "query",
      endpoint: "subscription_getSubscriptionRequests",
      arguments: {
        limit: 25,
        offset: 56
      },
      returnFields: "{ rows { id }, info { totalRows, currentPage, pageLength, totalPages }  }",
    }
  });
  expect(resp.statusCode).toEqual(200);
  const result = resp.json();
  console.log(result.data.subscription_getSubscriptionRequests);
});

 const createManySubscriptionRequests = (nbSubReq: number) => {
  const subReqList = [];
  for(let i=0; i<nbSubReq; i++) {
    subReqList.push({
      ...subreqSample,
      accountEmail: `${randomUUID()}@mail.com`,
      companyName: randomUUID(),
      companySiret: randomUUID(),
    })
  }
  return prismaClient.subscriptionRequest.createMany({
    data: subReqList,
  });
}
