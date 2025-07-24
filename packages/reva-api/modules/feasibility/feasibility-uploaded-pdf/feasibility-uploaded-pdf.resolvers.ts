import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Feasibility } from "@prisma/client";

import { getFileNameAndUrl } from "../feasibility.features";

import { resolversSecurityMap } from "./feasibility-uploaded-pdf.security";
import { getFeasibilityUploadedPdfByFeasibilityId } from "./features/getFeasibilityUploadedPdfByFeasibilityId";

const unsafeResolvers = {
  FeasibilityUploadedPdf: {
    feasibilityFile: ({
      feasibilityFileId,
      Feasibility,
    }: {
      feasibilityFileId: string;
      Feasibility: Feasibility;
    }) =>
      getFileNameAndUrl({
        candidacyId: Feasibility.candidacyId,
        fileId: feasibilityFileId,
      }),
    IDFile: ({
      Feasibility,
      IDFileId,
    }: {
      IDFileId: string;
      Feasibility: Feasibility;
    }) =>
      getFileNameAndUrl({
        candidacyId: Feasibility.candidacyId,
        fileId: IDFileId,
      }),
    documentaryProofFile: ({
      Feasibility,
      documentaryProofFileId: documentaryProofFileId,
    }: {
      Feasibility: Feasibility;
      documentaryProofFileId: string;
    }) =>
      getFileNameAndUrl({
        candidacyId: Feasibility.candidacyId,
        fileId: documentaryProofFileId,
      }),
    certificateOfAttendanceFile: ({
      Feasibility,
      certificateOfAttendanceFileId: certificateOfAttendanceFileId,
    }: {
      Feasibility: Feasibility;
      certificateOfAttendanceFileId: string;
    }) =>
      getFileNameAndUrl({
        candidacyId: Feasibility.candidacyId,
        fileId: certificateOfAttendanceFileId,
      }),
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
