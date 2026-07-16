import { isAdmin, isAnyone } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { buildAAPAuditLogUserInfoFromContext } from "../aap-log/features/logAAPAuditEvent";
import { isAccountEmailAlreadyUsed } from "../account/features/isAccountEmailAlreadyUsed";
import { isCompanySiretAlreadyUsed } from "../organism/features/isCompanySiretAlreadyUsed";
import { findEtablissement } from "../referential/features/entreprise";

import { createSubscriptionRequest } from "./features/createSubscriptionRequest";
import { getSubscriptionCountByStatus } from "./features/getSubscriptionCountByStatus";
import { getSubscriptionRequest } from "./features/getSubscriptionRequest";
import { getSubscriptionRequestFileNameUrlAndMimeType } from "./features/getSubscriptionRequestFileNameUrlAndMimeType";
import { getSubscriptionRequests } from "./features/getSubscriptionRequests";
import { rejectSubscriptionRequest } from "./features/rejectSubscriptionRequest";
import { validateSubscriptionRequest } from "./features/validateSubscriptionRequest";

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
    companySiretAlreadyUsed: async (
      { companySiret }: { companySiret: string },
      _: unknown,
    ) => isCompanySiretAlreadyUsed({ companySiret }),
    accountEmailAlreadyUsed: async (
      { accountEmail }: { accountEmail: string },
      _: unknown,
    ) => isAccountEmailAlreadyUsed({ accountEmail }),
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
      context: GraphqlContext,
    ) =>
      validateSubscriptionRequest({
        subscriptionRequestId,
        userInfo: buildAAPAuditLogUserInfoFromContext(context),
      }),
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

export const subscriptionRequestResolvers = withPolicies(unsafeResolvers, {
  // Champs publics: seuls accessibles sur la demande que l'appelant vient de créer
  // (aucune query publique ne renvoie une SubscriptionRequest par id).
  SubscriptionRequest: {
    attestationURSSAFFile: isAnyone,
    justificatifIdentiteDirigeantFile: isAnyone,
    lettreDeDelegationFile: isAnyone,
    justificatifIdentiteDelegataireFile: isAnyone,
    etablissement: isAnyone,
    companySiretAlreadyUsed: isAnyone,
    accountEmailAlreadyUsed: isAnyone,
  },
  Query: {
    subscription_getSubscriptionRequests: isAdmin,
    subscription_getSubscriptionRequest: isAdmin,
    subscription_getSubscriptionCountByStatus: isAdmin,
  },
  Mutation: {
    subscription_createSubscriptionRequest: isAnyone,
    subscription_validateSubscriptionRequest: isAdmin,
    subscription_rejectSubscriptionRequest: isAdmin,
  },
});
