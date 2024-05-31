import { composeResolvers } from "@graphql-tools/resolvers-composition";
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
import { createSubscriptionRequestV2 } from "./features/createSubscriptionRequestV2";
import { getSubscriptionRequestV2s } from "./features/getSubscriptionRequestV2s";
import { getSubscriptionRequestV2 } from "./features/getSubscriptionRequestV2";
import { getSubscriptionRequestV2FileNameUrlAndMimeType } from "./features/getSubscriptionRequestV2FileNameUrlAndMimeType";
import { rejectSubscriptionRequestV2 } from "./features/rejectSubscriptionRequestV2";
import { validateSubscriptionRequestV2 } from "./features/validateSubscriptionRequestV2";
import { findEtablissement } from "../referential/features/entreprise";

const unsafeResolvers = {
  SubscriptionRequest: {
    isCompanyNameUnique: async ({ companyName }: { companyName: string }) =>
      !(await OrganismDb.doesOrganismWithSameLabelExludingThoseInExperimentationExists(
        companyName,
      )),
  },
  SubscriptionRequestV2: {
    attestationURSSAFFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestV2FileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "attestationURSSAFFile",
      }),
    justificatifIdentiteDirigeantFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestV2FileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "justificatifIdentiteDirigeantFile",
      }),
    lettreDeDelegationFile: async (
      { id: subscriptionRequestId }: { id: string },

      _: unknown,
    ) =>
      getSubscriptionRequestV2FileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "lettreDeDelegationFile",
      }),
    justificatifIdentiteDelegataireFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestV2FileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "justificatifIdentiteDelegataireFile",
      }),
    etablissement: async (
      { companySiret }: { companySiret: string },
      _: unknown,
    ) =>
      findEtablissement({
        siret: companySiret,
      }),
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
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        return getSubscriptionRequests(
          {
            hasRole: context.auth.hasRole,
          },
          params,
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    subscription_getSubscriptionRequest: async (
      _parent: unknown,
      { subscriptionRequestId: id }: { subscriptionRequestId: string },
    ) => {
      const result = await domain.getSubscriptionRequest(
        { getSubscriptionRequestById: db.getSubscriptionRequestById },
        id,
      );

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    subscription_getSubscriptionRequestV2s: (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        status?: SubscriptionRequestStatus;
        searchFilter?: string;
      },
    ) => getSubscriptionRequestV2s(params),
    subscription_getSubscriptionRequestV2: (
      _parent: unknown,
      { subscriptionRequestId }: { subscriptionRequestId: string },
    ) => getSubscriptionRequestV2({ subscriptionRequestId }),
  },
  Mutation: {
    subscription_createSubscriptionRequest: async (
      _: unknown,
      payload: {
        subscriptionRequest: SubscriptionRequestInput;
      },
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
        payload.subscriptionRequest,
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
    ) => {
      try {
        const result = await domain.validateSubscriptionRequest({
          subscriptionRequestId: payload.subscriptionRequestId,
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
      },
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
        },
      );

      return result
        .map(() => "Ok")
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    subscription_createSubscriptionRequestV2: async (
      _: unknown,
      payload: {
        createSubscriptionRequestV2Input: CreateSubscriptionRequestV2Input;
      },
    ) =>
      createSubscriptionRequestV2({
        params: payload.createSubscriptionRequestV2Input,
      }),
    subscription_validateSubscriptionRequestV2: async (
      _: unknown,
      {
        subscriptionRequestId,
      }: {
        subscriptionRequestId: string;
      },
    ) => validateSubscriptionRequestV2({ subscriptionRequestId }),
    subscription_rejectSubscriptionRequestV2: async (
      _: unknown,
      {
        subscriptionRequestId,
        reason,
      }: {
        subscriptionRequestId: string;
        reason: string;
      },
    ) =>
      rejectSubscriptionRequestV2({
        subscriptionRequestId,
        reason,
      }),
  },
};

export const subscriptionRequestResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
