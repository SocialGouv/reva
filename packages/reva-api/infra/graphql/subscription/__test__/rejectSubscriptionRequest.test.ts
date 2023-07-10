/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { randomUUID } from "crypto";

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";
import { subreqSampleMin } from "./fixture";

let subreqId: string,
  ccn3239Id: string,
  domaineGdId: string,
  subreqOnDepSample: Array<any>;

describe("Subscription Request / Reject", () => {
  beforeAll(async () => {
    const res = await prismaClient.subscriptionRequest.create({
      data: {
        ...subreqSampleMin,
        typology: "generaliste",
      },
    });
    subreqId = res.id;

    const parisId = (
      await prismaClient.department.findFirst({
        where: { code: "75" },
      })
    )?.id;
    const illeEtVillaineId = (
      await prismaClient.department.findFirst({
        where: { code: "35" },
      })
    )?.id;

    ccn3239Id =
      (
        await prismaClient.conventionCollective.findFirst({
          where: { code: "3239" },
        })
      )?.id ?? "";

    domaineGdId =
      (
        await prismaClient.domaine.findFirst({
          where: { code: "GD" },
        })
      )?.id ?? "";

    subreqOnDepSample = [
      {
        departmentId: parisId,
        isOnSite: true,
        isRemote: false,
      },
      {
        departmentId: illeEtVillaineId,
        isOnSite: true,
        isRemote: true,
      },
    ];
  });

  test("Should fail when not exist", async () => {
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "blabla",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "subscription_rejectSubscriptionRequest",
        arguments: { subscriptionRequestId: randomUUID(), reason: "reason" },
        returnFields: "",
      },
    });
    expect(resp.statusCode).toEqual(200);
    const result = resp.json();
    expect(result).toHaveProperty("errors");
    expect(result.errors[0].extensions.code).toBe(
      "SUBSCRIPTION_REQUEST_NOT_FOUND"
    );
  });

  test("Should fail when not admin", async () => {
    const resp = await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: "blabla",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "subscription_rejectSubscriptionRequest",
        arguments: { subscriptionRequestId: subreqId, reason: "reason" },
        returnFields: "",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).toHaveProperty("errors");
  });

  describe("Should fulfill rejection", () => {
    test("with typology généraliste", async () => {
      const subreq = await prismaClient.subscriptionRequest.create({
        data: {
          ...subreqSampleMin,
          typology: "generaliste",
          departmentsWithOrganismMethods: {
            create: subreqOnDepSample,
          },
        },
      });
      const subreqId = subreq.id;
      const resp = await injectGraphql({
        fastify: (global as any).fastify,
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "blabla",
        }),
        payload: {
          requestType: "mutation",
          endpoint: "subscription_rejectSubscriptionRequest",
          arguments: { subscriptionRequestId: subreqId, reason: "reason" },
          returnFields: "",
        },
      });
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).toMatchObject({
        data: { subscription_rejectSubscriptionRequest: "Ok" },
      });

      // The subscription should no longer exist and have no remaining relations
      const sub = await prismaClient.subscriptionRequest.findUnique({
        where: { id: subreqId },
      });
      expect(sub).toMatchObject({ status: "REJECTED" });
    });

    test("with typology expert branche", async () => {
      const subreq = await prismaClient.subscriptionRequest.create({
        data: {
          ...subreqSampleMin,
          typology: "expertBranche",
          departmentsWithOrganismMethods: {
            create: subreqOnDepSample,
          },
          subscriptionRequestOnConventionCollective: {
            create: [{ ccnId: ccn3239Id }],
          },
        },
      });
      const subreqId = subreq.id;
      const resp = await injectGraphql({
        fastify: (global as any).fastify,
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "blabla",
        }),
        payload: {
          requestType: "mutation",
          endpoint: "subscription_rejectSubscriptionRequest",
          arguments: { subscriptionRequestId: subreqId, reason: "reason" },
          returnFields: "",
        },
      });
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).toMatchObject({
        data: { subscription_rejectSubscriptionRequest: "Ok" },
      });

      // The subscription should no longer exist and have no remaining relations
      const sub = await prismaClient.subscriptionRequest.findUnique({
        where: { id: subreqId },
      });
      expect(sub).toMatchObject({ status: "REJECTED" });
    });

    test("with typology expert filière", async () => {
      const subreq = await prismaClient.subscriptionRequest.create({
        data: {
          ...subreqSampleMin,
          typology: "expertFiliere",
          departmentsWithOrganismMethods: {
            create: subreqOnDepSample,
          },
          subscriptionRequestOnDomaine: {
            create: [{ domaineId: domaineGdId }],
          },
        },
      });
      const subreqId = subreq.id;
      const resp = await injectGraphql({
        fastify: (global as any).fastify,
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "blabla",
        }),
        payload: {
          requestType: "mutation",
          endpoint: "subscription_rejectSubscriptionRequest",
          arguments: { subscriptionRequestId: subreqId, reason: "reason" },
          returnFields: "",
        },
      });
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).toMatchObject({
        data: { subscription_rejectSubscriptionRequest: "Ok" },
      });

      // The subscription should no longer exist and have no remaining relations
      const sub = await prismaClient.subscriptionRequest.findUnique({
        where: { id: subreqId },
      });
      expect(sub).toMatchObject({ status: "REJECTED" });
    });
  });
});
