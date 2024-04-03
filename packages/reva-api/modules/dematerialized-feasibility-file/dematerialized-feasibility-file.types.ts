export interface DematerializedFeasibilityFileCreateOrUpdateCertificationInfoInput {
  candidacyId: string;
  firstForeignLanguage?: string;
  secondForeignLanguage?: string;
  option?: string;
  blocDeCompetencesIds: string[];
  completion: "COMPLETE" | "PARTIAL";
}
