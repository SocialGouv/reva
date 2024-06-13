export interface DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput {
  candidacyId: string;
  firstForeignLanguage?: string;
  secondForeignLanguage?: string;
  option?: string;
  blocDeCompetencesIds: string[];
  completion: "COMPLETE" | "PARTIAL";
}

export interface DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput {
  candidacyId: string;
  dematerializedFeasibilityFileId: string;
  competenceBlocId: string;
  competenceIdAndTexts: { competenceId: string; text: string }[];
}

export interface DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput {
  candidacyId: string;
  prerequisites: { id?: string; label: string; state: PrerequisiteState }[];
}

export type PrerequisiteState = "ACQUIRED" | "IN_PROGRESS" | "RECOMMENDED";

export interface DematerializedFeasibilityFileCreateOrUpdateDecisionInput {
  candidacyId: string;
  decision: DFFileDecision;
  decisionComment: string;
}

export interface DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput {
  candidacyId: string;
  idCard: GraphqlUploadedFile;
  equivalanceOrExemptionProof?: GraphqlUploadedFile;
  trainingCertificate?: GraphqlUploadedFile;
  otherAttachments?: GraphqlUploadedFile[];
}

export type DematerializedFeasibilityFileType =
  | "ID_CARD"
  | "EQUIVALENCE_OR_EXEMPTION_PROOF"
  | "TRAINING_CERTIFICATE"
  | "OTHER";

export type DFFileDecision = "ACCEPTED" | "REJECTED";
