import { DematerializedFeasibilityFile, Feasibility, FeasibilityUploadedPdf, File } from "@/graphql/generated/graphql";

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

  const defaultFile: File = {
    name: "dossier_de_faisabilite.pdf",
    url: "https://example.com",
    previewUrl: "https://example.com",
    mimeType: "application/pdf",
  };

  return {
    feasibilityFile: feasibilityFile ?? defaultFile,
    IDFile: IDFile ?? defaultFile,
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
