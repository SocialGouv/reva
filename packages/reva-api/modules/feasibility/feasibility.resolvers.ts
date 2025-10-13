import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { getCandidacy } from "../candidacy/features/getCandidacy";

import {
  getActiveFeasibilities,
  getActiveFeasibilityByCandidacyid,
  getActiveFeasibilityCountByCategory,
  getCertificationAuthorities,
  getFeasibilityById,
  getFileNameAndUrl,
} from "./feasibility.features";
import { resolversSecurityMap } from "./feasibility.security";
import { FeasibilityCategoryFilter } from "./feasibility.types";
import { getFeasibilityHistory } from "./features/getFeasibilityHistory";
import { revokeCertificationAuthorityDecision } from "./features/revokeCertificationAuthorityDecision";
import { updateFeasibilityFileTemplateFirstReadAt } from "./features/updateFeasibilityFileTemplateFirstReadAt";

const unsafeResolvers = {
  Candidacy: {
    certificationAuthorities: ({ id: candidacyId }: { id: string }) =>
      getCertificationAuthorities({ candidacyId }),
    feasibility: ({ id: candidacyId }: { id: string }) =>
      getActiveFeasibilityByCandidacyid({ candidacyId }),
  },
  Feasibility: {
    decisionFile: ({
      candidacyId,
      decisionFileId,
    }: {
      candidacyId: string;
      decisionFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: decisionFileId }),
    history: ({ candidacyId, id }: { candidacyId: string; id: string }) =>
      getFeasibilityHistory({ candidacyId, feasibilityId: id }),
    candidacy: ({ candidacyId }: { candidacyId: string }) =>
      getCandidacy({ candidacyId }),
  },
  Query: {
    feasibilityCountByCategory: (
      _: unknown,
      args: {
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
      },
      context: any,
    ) =>
      getActiveFeasibilityCountByCategory({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        ...args,
      }),
    feasibilities: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: FeasibilityCategoryFilter;
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
        cohorteVaeCollectiveId?: string;
      },
      context: any,
    ) =>
      getActiveFeasibilities({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        ...args,
      }),
    feasibility: (_: unknown, args: { feasibilityId: string }, context: any) =>
      getFeasibilityById({
        feasibilityId: args.feasibilityId,
        hasRole: context.auth.hasRole,
        keycloakId: context.auth?.userInfo?.sub,
      }),
    feasibility_getActiveFeasibilityByCandidacyId: (
      _parent: unknown,
      { candidacyId }: { candidacyId: string },
    ) => getActiveFeasibilityByCandidacyid({ candidacyId }),
  },
  Mutation: {
    feasibility_updateFeasibilityFileTemplateFirstReadAt: (
      _parent: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) => updateFeasibilityFileTemplateFirstReadAt({ candidacyId, context }),
    feasibility_revokeCertificationAuthorityDecision: (
      _parent: unknown,
      { feasibilityId, reason }: { feasibilityId: string; reason?: string },
      context: GraphqlContext,
    ) =>
      revokeCertificationAuthorityDecision({ feasibilityId, reason, context }),
  },
};

export const feasibilityResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
