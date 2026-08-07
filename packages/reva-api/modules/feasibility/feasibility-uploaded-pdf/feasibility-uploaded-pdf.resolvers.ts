import { Feasibility } from "@prisma/client";

import {
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  isAnyone,
} from "@/modules/shared/security/presets";
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

export const feasibilityUploadedPdfResolvers = withPolicies(unsafeResolvers, {
  // Le root d'un `FeasibilityUploadedPdf` porte la relation `Feasibility`, jamais `candidacyId` :
  // un middleware d'ownership y retomberait sur `root.id` et refuserait tout le monde. Le point
  // d'étranglement du sous-arbre est `Feasibility.feasibilityUploadedPdf` ci-dessous.
  FeasibilityUploadedPdf: {
    feasibilityFile: isAnyone,
    IDFile: isAnyone,
    documentaryProofFile: isAnyone,
    certificateOfAttendanceFile: isAnyone,
  },
  Feasibility: {
    // Point d'étranglement du sous-arbre PDF : la racine est une `Feasibility`, donc elle porte
    // `candidacyId` et le contrôle d'ownership est applicable ici.
    feasibilityUploadedPdf:
      isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  },
});
