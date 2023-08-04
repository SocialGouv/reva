import { FeasibilityStatus } from "@prisma/client";

import {
  getCandidacyById,
  getCertificationAuthority,
  getFeasibilities,
  getFeasibilityByCandidacyid,
  getFeasibilityById,
  getFeasibilityCountByCategory,
  getFileNameAndUrl,
  rejectFeasibility,
  validateFeasibility,
} from "./feasibility.features";

export const feasibilityResolvers = {
  Candidacy: {
    certificationAuthority: (parent: {
      certificationId: string;
      departmentId: string;
    }) => getCertificationAuthority(parent),
    feasibility: ({ id: candidacyId }: { id: string }) =>
      getFeasibilityByCandidacyid({ candidacyId }),
  },
  Feasibility: {
    feasibilityFile: ({
      candidacyId,
      feasibilityFileId,
    }: {
      candidacyId: string;
      feasibilityFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: feasibilityFileId }),
    otherFile: ({
      candidacyId,
      otherFileId: otherFileId,
    }: {
      candidacyId: string;
      otherFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: otherFileId }),
    candidacy: ({ candidacyId }: { candidacyId: string }) =>
      getCandidacyById({ candidacyId }),
  },
  Query: {
    feasibilityCountByCategory: (_: unknown, _args: unknown, context: any) =>
      getFeasibilityCountByCategory({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
      }),
    feasibilities: (
      _: unknown,
      args: { offset?: number; limit?: number; status?: FeasibilityStatus },
      context: any
    ) =>
      getFeasibilities({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        ...args,
      }),
    feasibility: (_: unknown, args: { feasibilityId: string }, context: any) =>
      getFeasibilityById({
        feasibilityId: args.feasibilityId,
        hasRole: context.auth.hasRole,
      }),
  },
  Mutation: {
    validateFeasibility: async (
      _: unknown,
      args: {
        feasibilityId: string;
        comment?: string;
      },
      context: any
    ) =>
      validateFeasibility({
        feasibilityId: args.feasibilityId,
        comment: args.comment,
        hasRole: context.auth.hasRole,
      }),
    rejectFeasibility: async (
      _: unknown,
      args: {
        feasibilityId: string;
        comment?: string;
      },
      context: any
    ) =>
      rejectFeasibility({
        feasibilityId: args.feasibilityId,
        comment: args.comment,
        hasRole: context.auth.hasRole,
      }),
  },
};
