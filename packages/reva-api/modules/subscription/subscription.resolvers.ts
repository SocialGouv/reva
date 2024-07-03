import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./security";
import { createSubscriptionRequest } from "./features/createSubscriptionRequest";
import { getSubscriptionRequests } from "./features/getSubscriptionRequests";
import { getSubscriptionRequest } from "./features/getSubscriptionRequest";
import { getSubscriptionRequestFileNameUrlAndMimeType } from "./features/getSubscriptionRequestFileNameUrlAndMimeType";
import { rejectSubscriptionRequest } from "./features/rejectSubscriptionRequest";
import { validateSubscriptionRequest } from "./features/validateSubscriptionRequest";
import { findEtablissement } from "../referential/features/entreprise";
import { getSubscriptionCountByStatus } from "./features/getSubscriptionCountByStatus";

const unsafeResolvers = {
  SubscriptionRequest: {
    attestationURSSAFFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestFileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "attestationURSSAFFile",
      }),
    justificatifIdentiteDirigeantFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestFileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "justificatifIdentiteDirigeantFile",
      }),
    lettreDeDelegationFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestFileNameUrlAndMimeType({
        subscriptionRequestId,
        fileType: "lettreDeDelegationFile",
      }),
    justificatifIdentiteDelegataireFile: async (
      { id: subscriptionRequestId }: { id: string },
      _: unknown,
    ) =>
      getSubscriptionRequestFileNameUrlAndMimeType({
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
    subscription_getSubscriptionRequests: (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        status?: SubscriptionRequestStatus;
        searchFilter?: string;
      },
    ) => getSubscriptionRequests(params),
    subscription_getSubscriptionRequest: (
      _parent: unknown,
      { subscriptionRequestId }: { subscriptionRequestId: string },
    ) => getSubscriptionRequest({ subscriptionRequestId }),
    subscription_getSubscriptionCountByStatus: (
      _parent: unknown,
      { searchFilter }: { searchFilter?: string },
    ) => getSubscriptionCountByStatus({ searchFilter }),
  },
  Mutation: {
    subscription_createSubscriptionRequest: async (
      _: unknown,
      payload: {
        createSubscriptionRequestInput: CreateSubscriptionRequestInput;
      },
    ) =>
      createSubscriptionRequest({
        params: payload.createSubscriptionRequestInput,
      }),
    subscription_validateSubscriptionRequest: async (
      _: unknown,
      {
        subscriptionRequestId,
      }: {
        subscriptionRequestId: string;
      },
    ) => validateSubscriptionRequest({ subscriptionRequestId }),
    subscription_rejectSubscriptionRequest: async (
      _: unknown,
      {
        subscriptionRequestId,
        reason,
        internalComment,
      }: {
        subscriptionRequestId: string;
        reason: string;
        internalComment?: string;
      },
    ) =>
      rejectSubscriptionRequest({
        subscriptionRequestId,
        reason,
        internalComment,
      }),
  },
};

export const subscriptionRequestResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
