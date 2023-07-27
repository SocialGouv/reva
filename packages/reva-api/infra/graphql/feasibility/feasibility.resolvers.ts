import {
  getCertificationAuthority,
  getFeasibilityByCandidacyid,
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
  },
};
