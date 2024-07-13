import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { getFileNameAndUrl } from "../feasibility.features";
import { resolversSecurityMap } from "./feasibility-uploaded-pdf.security";
import { getFeasibilityUploadedPdfByFeasibilityId } from "./features/getFeasibilityUploadedPdfByFeasibilityId";

const unsafeResolvers = {
  FeasibilityUploadedPdf: {
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
  },
  Feasibility: {
    feasibilityUploadedPdf: ({ id }: { id: string }) =>
      getFeasibilityUploadedPdfByFeasibilityId({
        feasibilityId: id,
      }),
  },
};

export const feasibilityUploadedPdfResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
