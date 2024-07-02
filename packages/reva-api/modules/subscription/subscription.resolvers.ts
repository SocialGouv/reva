import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./security";
import { createSubscriptionRequestV2 } from "./features/createSubscriptionRequestV2";
import { getSubscriptionRequestV2s } from "./features/getSubscriptionRequestV2s";
import { getSubscriptionRequestV2 } from "./features/getSubscriptionRequestV2";
import { getSubscriptionRequestV2FileNameUrlAndMimeType } from "./features/getSubscriptionRequestV2FileNameUrlAndMimeType";
import { rejectSubscriptionRequestV2 } from "./features/rejectSubscriptionRequestV2";
import { validateSubscriptionRequestV2 } from "./features/validateSubscriptionRequestV2";
import { findEtablissement } from "../referential/features/entreprise";
import { getSubscriptionCountByStatus } from "./features/getSubscriptionCountByStatus";

const unsafeResolvers = {
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
    subscription_getSubscriptionCountByStatus: (
      _parent: unknown,
      { searchFilter }: { searchFilter?: string },
    ) => getSubscriptionCountByStatus({ searchFilter }),
  },
  Mutation: {
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
        internalComment,
      }: {
        subscriptionRequestId: string;
        reason: string;
        internalComment?: string;
      },
    ) =>
      rejectSubscriptionRequestV2({
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
