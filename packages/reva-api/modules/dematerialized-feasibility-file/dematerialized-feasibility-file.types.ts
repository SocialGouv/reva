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
  competenceDetails: {
    competenceId: string;
    text: string;
    state: CompetenceDetailState;
  }[];
}

export type CompetenceDetailState = "YES" | "NO" | "PARTIALLY";

export interface DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput {
  candidacyId: string;
  prerequisites: { id?: string; label: string; state: PrerequisiteState }[];
}

export type PrerequisiteState = "ACQUIRED" | "IN_PROGRESS" | "RECOMMENDED";

export interface DematerializedFeasibilityFileCreateOrUpdateDecisionInput {
  candidacyId: string;
  aapDecision: DFFileDecision;
  aapDecisionComment: string;
}

export interface DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput {
  candidacyId: string;
  idCard: GraphqlUploadedFile;
  equivalenceOrExemptionProof?: GraphqlUploadedFile;
  trainingCertificate?: GraphqlUploadedFile;
  additionalFiles?: GraphqlUploadedFile[];
}

export interface DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput {
  candidacyId: string;
  swornStatement: GraphqlUploadedFile;
}

export type DematerializedFeasibilityFileType =
  | "ID_CARD"
  | "EQUIVALENCE_OR_EXEMPTION_PROOF"
  | "TRAINING_CERTIFICATE"
  | "ADDITIONAL";

export type DFFileDecision = "FAVORABLE" | "UNFAVORABLE";
