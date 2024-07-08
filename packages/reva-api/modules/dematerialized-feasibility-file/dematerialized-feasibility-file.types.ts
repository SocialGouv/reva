export interface DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput {
  firstForeignLanguage?: string;
  secondForeignLanguage?: string;
  option?: string;
  blocDeCompetencesIds: string[];
  completion: "COMPLETE" | "PARTIAL";
}

export interface DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput {
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
  prerequisites: { id?: string; label: string; state: PrerequisiteState }[];
}

export type PrerequisiteState = "ACQUIRED" | "IN_PROGRESS" | "RECOMMENDED";

export interface DematerializedFeasibilityFileCreateOrUpdateDecisionInput {
  aapDecision: DFFileDecision;
  aapDecisionComment: string;
}

export interface DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput {
  idCard: GraphqlUploadedFile;
  equivalenceOrExemptionProof?: GraphqlUploadedFile;
  trainingCertificate?: GraphqlUploadedFile;
  additionalFiles?: GraphqlUploadedFile[];
}

export interface DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput {
  swornStatement: GraphqlUploadedFile;
}

export type DematerializedFeasibilityFileType =
  | "ID_CARD"
  | "EQUIVALENCE_OR_EXEMPTION_PROOF"
  | "TRAINING_CERTIFICATE"
  | "ADDITIONAL";

export type DFFileDecision = "FAVORABLE" | "UNFAVORABLE";
