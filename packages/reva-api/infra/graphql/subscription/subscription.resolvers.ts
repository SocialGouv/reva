import { composeResolvers } from "@graphql-tools/resolvers-composition";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { LegalStatus } from "@prisma/client";
import mercurius from "mercurius";

import * as AccountDb from "../../database/postgres/accounts";
import * as OrganismDb from "../../database/postgres/organisms";
import * as IAM from "../../iam/keycloak";
import * as db from "./db/subscription-request";
import * as domain from "./domain/index";
import { resolversSecurityMap } from "./security";

interface getSubscriptionRequestsParams extends FilteredPaginatedListArgs {
  orderBy?: {
    companyName?: Sort;
    accountLastname?: Sort;
  };
}

const unsafeResolvers = {
  Query: {
    subscription_getSubscriptionRequests: async (
      _parent: unknown,
      payload: getSubscriptionRequestsParams
    ) => {
      const result = await domain.getSubscriptionRequests(
        { getSubscriptionRequests: db.getSubscriptionRequests },
        payload
      );
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    subscription_getSubscriptionRequest: async (
      _parent: unknown,
      { subscriptionRequestId: id }: { subscriptionRequestId: string }
    ) => {
      const result = await domain.getSubscriptionRequest(
        { getSubscriptionRequestById: db.getSubscriptionRequestById },
        id
      );
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
  Mutation: {
    subscription_createSubscriptionRequest: async (
      _: unknown,
      payload: {
        subscriptionRequest: {
          companyName: string;
          companyLegalStatus: LegalStatus;
          companySiret: string;
          companyAddress: string;
          companyBillingAddress: string;
          companyBillingEmail: string;
          companyBic: string;
          companyIban: string;
          accountFirstname: string;
          accountLastname: string;
          accountEmail: string;
          accountPhoneNumber: string;
        };
      }
    ) => {
      const result = await domain.createSubscriptionRequest(
        { createSubscriptionRequest: db.createSubscriptionRequest },
        payload.subscriptionRequest
      );
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    subscription_validateSubscriptionRequest: async (
      _: unknown,
      payload: {
        subscriptionRequestId: string;
      },
      context: {
        app: {
          getKeycloakAdmin: () => KeycloakAdminClient;
        };
      }
    ) => {
      const keycloakAdmin = await context.app.getKeycloakAdmin();
      const result = await domain.validateSubscriptionRequest(
        {
          getSubscriptionRequestById: db.getSubscriptionRequestById,
          deleteSubscriptioRequestById: db.deleteSubscriptionRequestById,
          createAccountInIAM: IAM.createAccount(keycloakAdmin),
          createAccountProfile: AccountDb.createAccountProfile,
          getAccountFromEmail: AccountDb.getAccountFromEmail,
          getOrganismBySiret: OrganismDb.getOrganismBySiret,
          createOrganism: OrganismDb.createOrganism,
        },
        { subscriptionRequestId: payload.subscriptionRequestId }
      );

      return result
        .map(() => "Ok")
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};

export const subscriptionRequestResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap
);
