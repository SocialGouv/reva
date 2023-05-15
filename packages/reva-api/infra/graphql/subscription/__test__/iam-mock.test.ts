/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";
import {
  __TEST_IAM_FAIL_CHECK__,
  __TEST_IAM_PASS_CHECK__,
} from "../domain/test-const";
import { subreqSampleMin } from "./fixture";

afterEach(async () => {
  await prismaClient.account.deleteMany();
  await prismaClient.organism.deleteMany();
});

test("validating should fail - IAM.getAccount will always return sth", async () => {
  const res = await prismaClient.subscriptionRequest.create({
    data: {
      ...subreqSampleMin,
      accountEmail: __TEST_IAM_FAIL_CHECK__,
      typology: "generaliste",
    },
  });
  const subreqId = res.id;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "subscription_validateSubscriptionRequest",
      arguments: { subscriptionRequestId: subreqId },
      returnFields: "",
    },
  });
  const result = resp.json();
  console.log(result);
  expect(resp.statusCode).toEqual(200);
  expect(result).toHaveProperty("errors");
});

test("validating should pass twice - IAM.createAccount mock test 1/2", async () => {
  const res = await prismaClient.subscriptionRequest.create({
    data: {
      ...subreqSampleMin,
      accountEmail: __TEST_IAM_PASS_CHECK__,
      typology: "generaliste",
    },
  });
  const subreqId = res.id;

  const gqlRequest = {
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation" as const,
      endpoint: "subscription_validateSubscriptionRequest",
      arguments: { subscriptionRequestId: subreqId },
      returnFields: "",
    },
  };
  const resp = await injectGraphql(gqlRequest);
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).not.toHaveProperty("errors");
});

test("validating should pass twice - IAM.createAccount mock test 2/2", async () => {
  const res = await prismaClient.subscriptionRequest.create({
    data: {
      ...subreqSampleMin,
      accountEmail: __TEST_IAM_PASS_CHECK__,
      typology: "generaliste",
    },
  });
  const subreqId = res.id;

  const gqlRequest = {
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "admin",
      keycloakId: "blabla",
    }),
    payload: {
      requestType: "mutation" as const,
      endpoint: "subscription_validateSubscriptionRequest",
      arguments: { subscriptionRequestId: subreqId },
      returnFields: "",
    },
  };
  const resp = await injectGraphql(gqlRequest);
  expect(resp.statusCode).toEqual(200);
  expect(resp.json()).not.toHaveProperty("errors");
});
