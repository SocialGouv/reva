import {
  DematerializedFeasibilityFile,
  Feasibility,
  FeasibilityUploadedPdf,
  File,
} from "@/graphql/generated/graphql";

export type FeasibilityEntity = Partial<
  Omit<Feasibility, "dematerializedFeasibilityFile" | "feasibilityUploadedPdf">
> & {
  dematerializedFeasibilityFile?: Partial<DematerializedFeasibilityFile> | null;
  feasibilityUploadedPdf?: Partial<FeasibilityUploadedPdf> | null;
};

export const createFeasibilityUploadedPdfEntity = (
  options?: Partial<FeasibilityUploadedPdf>,
): Partial<FeasibilityUploadedPdf> => {
  const {
    feasibilityFile,
    IDFile,
    documentaryProofFile,
    certificateOfAttendanceFile,
  } = options || {};

  const defaultFeasibilityFile: File = {
    name: "dossier_de_faisabilite.pdf",
    url: "https://example.com/dossier_de_faisabilite.pdf",
    previewUrl: "https://example.com/dossier_de_faisabilite.pdf",
    mimeType: "application/pdf",
  };

  const defaultIdFile: File = {
    name: "piece_identite.pdf",
    url: "https://example.com/piece_identite.pdf",
    previewUrl: "https://example.com/piece_identite.pdf",
    mimeType: "application/pdf",
  };

  return {
    feasibilityFile: feasibilityFile ?? defaultFeasibilityFile,
    IDFile: IDFile ?? defaultIdFile,
    documentaryProofFile: documentaryProofFile ?? null,
    certificateOfAttendanceFile: certificateOfAttendanceFile ?? null,
  };
};

export const createFeasibilityEntity = (
  options?: FeasibilityEntity,
): FeasibilityEntity => {
  const {
    decision,
    feasibilityFormat,
    decisionSentAt,
    feasibilityFileSentAt,
    history,
    dematerializedFeasibilityFile,
  } = options || {};

  return {
    id: "1",
    decision: decision || "DRAFT",
    feasibilityFormat: feasibilityFormat || "DEMATERIALIZED",
    decisionSentAt: decisionSentAt || null,
    feasibilityFileSentAt: feasibilityFileSentAt || null,
    history: history || [],
    dematerializedFeasibilityFile: dematerializedFeasibilityFile ?? null,
  };
};
