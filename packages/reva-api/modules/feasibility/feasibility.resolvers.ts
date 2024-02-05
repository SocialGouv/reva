import {
  getActiveFeasibilities,
  getActiveFeasibilityByCandidacyid,
  getActiveFeasibilityCountByCategory,
  getCertificationAuthorities,
  getFeasibilityById,
  getFileNameAndUrl,
} from "./feasibility.features";
import { FeasibilityCategoryFilter } from "./feasibility.types";
import { getFeasibilityHistory } from "./features/getFeasibilityHistory";

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
    IDFile: ({
      candidacyId,
      IDFileId,
    }: {
      candidacyId: string;
      IDFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: IDFileId }),
    documentaryProofFile: ({
      candidacyId,
      documentaryProofFileId: documentaryProofFileId,
    }: {
      candidacyId: string;
      documentaryProofFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: documentaryProofFileId }),
    certificateOfAttendanceFile: ({
      candidacyId,
      certificateOfAttendanceFileId: certificateOfAttendanceFileId,
    }: {
      candidacyId: string;
      certificateOfAttendanceFileId: string;
    }) =>
      getFileNameAndUrl({ candidacyId, fileId: certificateOfAttendanceFileId }),
    history: ({ candidacyId, id }: { candidacyId: string; id: string }) =>
      getFeasibilityHistory({ candidacyId, feasibilityId: id }),
  },
  Query: {
    feasibilityCountByCategory: (
      _: unknown,
      _params: {
        searchFilter?: string;
      },
      context: any,
    ) =>
      getActiveFeasibilityCountByCategory({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
        searchFilter: _params.searchFilter,
      }),
    feasibilities: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: FeasibilityCategoryFilter;
        searchFilter?: string;
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
  },
};
