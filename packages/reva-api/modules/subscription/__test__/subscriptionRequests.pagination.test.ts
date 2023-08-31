/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { randomUUID } from "crypto";

import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { subreqSampleMin } from "./fixture";

const NB_SUBSCRIPTION_REQUESTS = 40;

beforeAll(() => {
  return prismaClient.subscriptionRequest
    .deleteMany()
    .then(() => createManySubscriptionRequests(NB_SUBSCRIPTION_REQUESTS));
});

afterAll(() => {
  return prismaClient.subscriptionRequest.deleteMany();
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
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).toHaveProperty("errors");
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
        offset: 56,
      },
      returnFields:
        "{ rows { id }, info { totalRows, currentPage, pageLength, totalPages }  }",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const result = resp.json();
  expect(result).not.toHaveProperty("errors");
  console.log(result.data.subscription_getSubscriptionRequests);
});

const createManySubscriptionRequests = (nbSubReq: number) => {
  const subReqList = [];
  for (let i = 0; i < nbSubReq; i++) {
    subReqList.push({
      ...subreqSampleMin,
      accountEmail: `${randomUUID()}@mail.com`,
      companyName: randomUUID(),
      companySiret: randomUUID(),
      typology: "generaliste" as const,
    });
  }
  return prismaClient.subscriptionRequest.createMany({
    data: subReqList,
  });
};
