/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { randomUUID } from "crypto";

import { Prisma } from "@prisma/client";

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";
import {
  __TEST_IAM_FAIL_CHECK__,
  __TEST_IAM_PASS_CHECK__,
} from "../domain/test-const";
import { subreqSampleMin } from "./fixture";

let subreqWithDepts: Prisma.SubscriptionRequestCreateInput,
  ccn3133Id: string,
  domaineGdId: string;

describe("Subscription Request / Validate", () => {
  beforeAll(async () => {
    // await prismaClient.organism.deleteMany();
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

    subreqWithDepts = {
      ...subreqSampleMin,
      typology: "generaliste",
      departmentsWithOrganismMethods: {
        create: [
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
        ] as any,
      },
    };
  });

  beforeEach(async () => {
    await prismaClient.organism.deleteMany();
    await prismaClient.account.deleteMany();
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
        endpoint: "subscription_validateSubscriptionRequest",
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
        endpoint: "subscription_validateSubscriptionRequest",
        arguments: { subscriptionRequestId: randomUUID() },
        returnFields: "",
      },
    });
    expect(resp.statusCode).toEqual(200);
    expect(resp.json()).toHaveProperty("errors");
  });

  test.todo("Should fail when keycloak account already exist with same Email");
  test.todo("Should fail when organism already exist with same Siret");
  test.todo("Should fail when account already exist with same Email");

  describe("Should fulfill validation", () => {
    test("with typology généraliste", async () => {
      const res = await prismaClient.subscriptionRequest.create({
        data: {
          ...subreqWithDepts,
          accountEmail: __TEST_IAM_PASS_CHECK__,
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
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).toMatchObject({
        data: { subscription_validateSubscriptionRequest: "Ok" },
      });

      // A new organism should have been created
      const organism = await prismaClient.organism.findFirst({
        where: { siret: subreqSampleMin.companySiret },
      });
      expect(organism).toMatchObject({
        label: subreqSampleMin.companyName,
        legalStatus: subreqSampleMin.companyLegalStatus,
        address: subreqSampleMin.companyAddress,
        zip: subreqSampleMin.companyZipCode,
        city: subreqSampleMin.companyCity,
        contactAdministrativeEmail: __TEST_IAM_PASS_CHECK__,
        contactCommercialName: `${subreqSampleMin.companyBillingContactLastname} ${subreqSampleMin.companyBillingContactFirstname}`,
        contactCommercialEmail: subreqSampleMin.companyBillingEmail,
        isActive: true,
        typology: "generaliste",
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
          ...subreqWithDepts,
          accountEmail: __TEST_IAM_PASS_CHECK__,
          typology: "expertBranche",
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
          endpoint: "subscription_validateSubscriptionRequest",
          arguments: { subscriptionRequestId: subreqId },
          returnFields: "",
        },
      });
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).toMatchObject({
        data: { subscription_validateSubscriptionRequest: "Ok" },
      });

      // A new organism should have been created
      const organism = await prismaClient.organism.findFirst({
        where: { siret: subreqSampleMin.companySiret },
        include: {
          organismOnConventionCollective: true,
        },
      });
      expect(organism).toMatchObject({
        label: subreqSampleMin.companyName,
        legalStatus: subreqSampleMin.companyLegalStatus,
        address: subreqSampleMin.companyAddress,
        zip: subreqSampleMin.companyZipCode,
        city: subreqSampleMin.companyCity,
        contactAdministrativeEmail: __TEST_IAM_PASS_CHECK__,
        contactCommercialName: `${subreqSampleMin.companyBillingContactLastname} ${subreqSampleMin.companyBillingContactFirstname}`,
        contactCommercialEmail: subreqSampleMin.companyBillingEmail,
        isActive: true,
        typology: "expertBranche",
        organismOnConventionCollective: [
          {
            ccnId: ccn3133Id,
          },
        ],
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
          ...subreqWithDepts,
          accountEmail: __TEST_IAM_PASS_CHECK__,
          typology: "expertFiliere",
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
          endpoint: "subscription_validateSubscriptionRequest",
          arguments: { subscriptionRequestId: subreqId },
          returnFields: "",
        },
      });
      expect(resp.statusCode).toEqual(200);
      expect(resp.json()).toMatchObject({
        data: { subscription_validateSubscriptionRequest: "Ok" },
      });

      // A new organism should have been created
      const organism = await prismaClient.organism.findFirst({
        where: { siret: subreqSampleMin.companySiret },
        include: {
          organismOnDomaine: true,
        },
      });
      expect(organism).toMatchObject({
        label: subreqSampleMin.companyName,
        legalStatus: subreqSampleMin.companyLegalStatus,
        address: subreqSampleMin.companyAddress,
        zip: subreqSampleMin.companyZipCode,
        city: subreqSampleMin.companyCity,
        contactAdministrativeEmail: __TEST_IAM_PASS_CHECK__,
        contactCommercialName: `${subreqSampleMin.companyBillingContactLastname} ${subreqSampleMin.companyBillingContactFirstname}`,
        contactCommercialEmail: subreqSampleMin.companyBillingEmail,
        isActive: true,
        typology: "expertFiliere",
        organismOnDomaine: [
          {
            domaineId: domaineGdId,
          },
        ],
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
