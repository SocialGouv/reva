/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { LegalStatus } from "@prisma/client";

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";
import {
  __TEST_IAM_FAIL_CHECK__,
  __TEST_IAM_PASS_CHECK__,
} from "../domain/test-const";

const subreqSampleMin = {
  companySiret: "1234888",
  companyLegalStatus: LegalStatus.SAS,
  companyName: "Jojo formation",
  companyAddress: "64 boulevard du Général Leclerc",
  companyZipCode: "35660",
  companyCity: "Fougères",
  companyBillingContactFirstname: "Josette",
  companyBillingContactLastname: "Lacomptable",
  companyBillingEmail: "billingjosette@jojo-formation.fr",
  companyBillingPhoneNumber: "03214556789",
  companyBic: "1232131",
  companyIban: "234345343",
  accountFirstname: "Jojo",
  accountLastname: "Landouille",
  accountEmail: "contact@jojo-formation.fr",
  accountPhoneNumber: "03214556789",
};

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
