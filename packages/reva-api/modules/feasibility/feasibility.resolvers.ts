import { composeResolvers } from "@graphql-tools/resolvers-composition";
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

const unsafeResolvers = {
  Candidacy: {
    certificationAuthorities: ({
      id: candidacyId,
      departmentId,
    }: {
      id: string;
      departmentId: string;
    }) => getCertificationAuthorities({ candidacyId, departmentId }),
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
  },
  Query: {
    feasibilityCountByCategory: (
      _: unknown,
      _params: {
        searchFilter?: string;
        certificationAuthorityId?: string;
      },
      context: any,
    ) =>
      getActiveFeasibilityCountByCategory({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        searchFilter: _params.searchFilter,
        certificationAuthorityId: _params.certificationAuthorityId,
      }),
    feasibilities: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: FeasibilityCategoryFilter;
        searchFilter?: string;
        certificationAuthorityId?: string;
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
};

export const feasibilityResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
