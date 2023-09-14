import { FeasibilityStatus } from "@prisma/client";

import {
  getActiveFeasibilities,
  getActiveFeasibilityByCandidacyid,
  getActiveFeasibilityCountByCategory,
  getCandidacyById,
  getCertificationAuthorities,
  getFeasibilityById,
  getFileNameAndUrl,
} from "./feasibility.features";

export const feasibilityResolvers = {
  Candidacy: {
    certificationAuthorities: (parent: {
      certificationId: string;
      departmentId: string;
    }) => getCertificationAuthorities(parent),
    feasibility: ({ id: candidacyId }: { id: string }) =>
      getActiveFeasibilityByCandidacyid({ candidacyId }),
  },
  Feasibility: {
    feasibilityFile: ({
      candidacyId,
      feasibilityFileId,
    }: {
      candidacyId: string;
      feasibilityFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: feasibilityFileId }),
    documentaryProofFile: ({
      candidacyId,
      documentaryProofFileId: documentaryProofFileId,
    }: {
      candidacyId: string;
      documentaryProofFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: documentaryProofFileId }),
    candidacy: ({ candidacyId }: { candidacyId: string }) =>
      getCandidacyById({ candidacyId }),
    certificateOfAttendanceFile: ({
      candidacyId,
      certificateOfAttendanceFileId: certificateOfAttendanceFileId,
    }: {
      candidacyId: string;
      certificateOfAttendanceFileId: string;
    }) =>
      getFileNameAndUrl({ candidacyId, fileId: certificateOfAttendanceFileId }),
  },
  Query: {
    feasibilityCountByCategory: (_: unknown, _args: unknown, context: any) =>
      getActiveFeasibilityCountByCategory({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
      }),
    feasibilities: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        status?: FeasibilityStatus;
        searchFilter?: string;
      },
      context: any
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
  },
};
