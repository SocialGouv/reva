import { composeResolvers } from "@graphql-tools/resolvers-composition";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import mercurius from "mercurius";

import * as AccountDb from "../../database/postgres/accounts";
import * as OrganismDb from "../../database/postgres/organisms";
import * as IAM from "../../iam/keycloak";
import * as db from "./db/subscription-request";
import * as domain from "./domain/index";
import { sendRejectionEmail } from "./mail";
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
        {
          getSubscriptionRequests: db.getSubscriptionRequests,
          getSubscriptionRequestsCount: db.getSubscriptionRequestsCount,
        },
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
        subscriptionRequest: SubscriptionRequestInput;
      }
    ) => {
      const result = await domain.createSubscriptionRequest(
        {
          createSubscriptionRequest: db.createSubscriptionRequest,
          existOrganismWithTypologyAndSiret:
            OrganismDb.existOrganismWithTypologyAndSiret,
          existSubscriptionRequestWithTypologyAndSiret:
            db.existSubscriptionRequestWithTypologyAndSiret,
        },
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
          deleteSubscriptionRequestById: db.deleteSubscriptionRequestById,
          getIamAccount: IAM.getAccount(keycloakAdmin),
          createAccountInIAM: IAM.createAccount(keycloakAdmin),
          createAccountProfile: AccountDb.createAccountProfile,
          getAccountFromEmail: AccountDb.getAccountFromEmail,
          getOrganismBySiretOrLabelAndTypology:
            OrganismDb.getOrganismBySiretOrLabelAndTypology,
          createOrganism: OrganismDb.createOrganism,
        },
        { subscriptionRequestId: payload.subscriptionRequestId }
      );

      return result
        .map(() => "Ok")
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    subscription_rejectSubscriptionRequest: async (
      _: unknown,
      payload: {
        subscriptionRequestId: string;
        reason: string;
      }
    ) => {
      const result = await domain.rejectSubscriptionRequest(
        {
          getSubscriptionRequestById: db.getSubscriptionRequestById,
          deleteSubscriptionRequestById: db.deleteSubscriptionRequestById,
          sendRejectionEmail,
        },
        {
          subscriptionRequestId: payload.subscriptionRequestId,
          reason: payload.reason,
        }
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
