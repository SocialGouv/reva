import { Feasibility } from "@prisma/client";

import { isAnyone } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { getFileNameAndUrl } from "../feasibility.features";

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

// L'ancienne map ne déclarait que `"Query.*"` et `"Mutation.*"`, alors que ce module n'expose ni
// `Query` ni `Mutation` : elle n'enveloppait aucun resolver. Ces cinq champs tournaient déjà sans
// garde, la migration ne change donc rien au runtime.
export const feasibilityUploadedPdfResolvers = withPolicies(unsafeResolvers, {
  FeasibilityUploadedPdf: {
    feasibilityFile: isAnyone,
    IDFile: isAnyone,
    documentaryProofFile: isAnyone,
    certificateOfAttendanceFile: isAnyone,
  },
  Feasibility: {
    feasibilityUploadedPdf: isAnyone,
  },
});
