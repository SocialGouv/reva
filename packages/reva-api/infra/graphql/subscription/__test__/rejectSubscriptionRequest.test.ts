/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { randomUUID } from "crypto";

import { LegalStatus } from "@prisma/client";

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";

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

let subreqId: string,
  ccn3133Id: string,
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

    ccn3133Id =
      (
        await prismaClient.conventionCollective.findFirst({
          where: { code: "3133" },
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
        arguments: { subscriptionRequestId: randomUUID() },
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
        arguments: { subscriptionRequestId: subreqId },
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
          arguments: { subscriptionRequestId: subreqId },
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
      expect(sub).toBeNull();
      const subOnCCN =
        await prismaClient.subscriptionRequestOnConventionCollective.findMany({
          where: { subscriptionRequestId: subreqId },
        });
      expect(subOnCCN.length).toEqual(0);
      const subOnDom = await prismaClient.subscriptionRequestOnDomaine.findMany(
        {
          where: { subscriptionRequestId: subreqId },
        }
      );
      expect(subOnDom.length).toEqual(0);
      const subOnDep =
        await prismaClient.subscriptionRequestsOnDepartments.findMany({
          where: { subscriptionRequestId: subreqId },
        });
      expect(subOnDep.length).toEqual(0);
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
            create: [{ ccnId: ccn3133Id }],
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
          arguments: { subscriptionRequestId: subreqId },
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
      expect(sub).toBeNull();
      const subOnCCN =
        await prismaClient.subscriptionRequestOnConventionCollective.findMany({
          where: { subscriptionRequestId: subreqId },
        });
      expect(subOnCCN.length).toEqual(0);
      const subOnDom = await prismaClient.subscriptionRequestOnDomaine.findMany(
        {
          where: { subscriptionRequestId: subreqId },
        }
      );
      expect(subOnDom.length).toEqual(0);
      const subOnDep =
        await prismaClient.subscriptionRequestsOnDepartments.findMany({
          where: { subscriptionRequestId: subreqId },
        });
      expect(subOnDep.length).toEqual(0);
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
          arguments: { subscriptionRequestId: subreqId },
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
      expect(sub).toBeNull();
      const subOnCCN =
        await prismaClient.subscriptionRequestOnConventionCollective.findMany({
          where: { subscriptionRequestId: subreqId },
        });
      expect(subOnCCN.length).toEqual(0);
      const subOnDom = await prismaClient.subscriptionRequestOnDomaine.findMany(
        {
          where: { subscriptionRequestId: subreqId },
        }
      );
      expect(subOnDom.length).toEqual(0);
      const subOnDep =
        await prismaClient.subscriptionRequestsOnDepartments.findMany({
          where: { subscriptionRequestId: subreqId },
        });
      expect(subOnDep.length).toEqual(0);
    });
  });
});
