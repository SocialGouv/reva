export interface DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput {
  firstForeignLanguage?: string;
  secondForeignLanguage?: string;
  option?: string;
  blocDeCompetencesIds: string[];
  completion: "COMPLETE" | "PARTIAL";
}

export interface DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput {
  dematerializedFeasibilityFileId: string;
  competenceBloc: {
    id: string;
    text: string;
  };
  competenceDetails: {
    competenceId: string;
    state: CompetenceDetailState;
  }[];
}

type EligibilityRequirement =
  | "FULL_ELIGIBILITY_REQUIREMENT"
  | "PARTIAL_ELIGIBILITY_REQUIREMENT";

export interface DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput {
  eligibilityRequirement: EligibilityRequirement;
  eligibilityValidUntil: number;
}

type CompetenceDetailState = "YES" | "NO" | "PARTIALLY";

export interface DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput {
  prerequisites: {
    id?: string;
    label: string;
    state: PrerequisiteState;
    certificationPrerequisiteId?: string;
  }[];
}

type PrerequisiteState = "ACQUIRED" | "IN_PROGRESS" | "RECOMMENDED";

export interface DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput {
  aapDecision: DFFileAapDecision;
  aapDecisionComment: string;
}

export interface DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput {
  decision: DFFileCertificationAuthorityDecision;
  decisionComment: string;
  decisionFile?: GraphqlUploadedFile;
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

type DFFileAapDecision = "FAVORABLE" | "UNFAVORABLE";

type DFFileCertificationAuthorityDecision =
  | "ADMISSIBLE"
  | "REJECTED"
  | "INCOMPLETE"
  | "COMPLETE";

export interface DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput {
  candidateDecisionComment: string;
}
