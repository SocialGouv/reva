import {
  getCandidacyById,
  getCertificationAuthority,
  getFeasibilities,
  getFeasibilityByCandidacyid,
  getFeasibilityCountByCategory,
  getFileNameAndUrl,
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
    feasibilities: (_: unknown, _args: unknown, context: any) =>
      getFeasibilities({
        keycloakId: context.auth.userInfo?.sub,
        hasRole: context.auth.hasRole,
      }),
  },
};
