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
  competenceIdAndTexts: { competenceId: string; text: string }[];
}
