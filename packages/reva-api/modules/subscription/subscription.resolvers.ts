import { composeResolvers } from "@graphql-tools/resolvers-composition";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import mercurius from "mercurius";

import * as OrganismDb from "../organism/database/organisms";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import * as db from "./db/subscription-request";
import * as domain from "./domain/index";
import { getSubscriptionRequests } from "./features/getSubscriptionRequests";
import { sendRejectionEmail } from "./mail";
import { sendSubscriptionValidationInProgressEmail } from "./mail/validationInProgress";
import { resolversSecurityMap } from "./security";

const unsafeResolvers = {
  SubscriptionRequest: {
    isCompanyNameUnique: async ({ companyName }: { companyName: string }) =>
      !(await OrganismDb.doesOrganismWithSameLabelExludingThoseInExperimentationExists(
        companyName
      )),
  },
  Query: {
    subscription_getSubscriptionRequests: async (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        status?: SubscriptionRequestStatus;
        searchFilter?: string;
      },
      context: GraphqlContext
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized"
          );
        }

        return getSubscriptionRequests(
          {
            hasRole: context.auth.hasRole,
          },
          params
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
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
          sendSubscriptionValidationInProgressEmail:
            sendSubscriptionValidationInProgressEmail,
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
      try {
        const result = await domain.validateSubscriptionRequest({
          subscriptionRequestId: payload.subscriptionRequestId,
          keycloakAdmin,
        });
        return result;
      } catch (e) {
        throw new mercurius.ErrorWithProps((e as Error).message, e as object);
      }
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
          rejectSubscriptionRequestById: db.rejectSubscriptionRequestById,
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
