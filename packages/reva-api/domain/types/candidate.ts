export interface Candidate {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export type CANDIDATE_LOGIN_ACTION = "registration" | "login";

export interface CandidateRegistrationInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  action: "registration";
}

export interface CandidateLoginInput {
  email: string;
  action: "login";
}

export type CandidateAuthenticationInput =
  | CandidateRegistrationInput
  | CandidateLoginInput;

export interface TrainingForm {
  individualHourCount: number;
  collectiveHourCount: number;
  basicSkills: any;
  mandatoryTrainings: any;
  otherTraining: string;
}

export interface FundingRequest {
  basicSkills: any;
  basicSkillsCost: number;
  basicSkillsHourCount: number;
  candidacyId: string;
  certificateSkills: string;
  certificateSkillsCost: number;
  certificateSkillsHourCount: number;
  collectiveCost: number;
  collectiveHourCount: number;
  diagnosisCost: number;
  diagnosisHourCount: number;
  examCost: number;
  examHourCount: number;
  id: string;
  individualCost: number;
  individualHourCount: number;
  mandatoryTrainings: any;
  mandatoryTrainingsCost: number;
  mandatoryTrainingsHourCount: number;
  otherTraining: string;
  postExamCost: number;
  postExamHourCount: number;
  otherTrainingHourCount: number;
  totalCost?: number;
  companionId: string;
}

export interface FundingRequestInput extends FundingRequest {
  mandatoryTrainingsIds: string[];
  basicSkillsIds: string[];
}

export interface FundingRequestInformations {
  training: TrainingForm;
  fundingRequest: FundingRequest | null;
}

export interface FundingRequestBatch {
  fundingRequestId: string;
  sent: boolean;
  batchFileName?: string;
  content?: FundingRequestBatchContent;
}

export interface FundingRequestBatchContent {
  NumAction: string;
  NomAP: string;
  SiretAP: string;
  CertificationVisée: string;
  NomCandidat: string;
  PrenomCandidat1: string;
  PrenomCandidat2: string;
  PrenomCandidat3: string;
  GenreCandidat: "0" | "1" | "2";
  NiveauObtenuCandidat: string;
  IndPublicFragile: "0" | "1" | "2" | "3";
  NbHeureDemAPDiag: number;
  CoutHeureDemAPDiag: number;
  NbHeureDemAPPostJury: number;
  CoutHeureDemAPPostJury: number;
  AccompagnateurCandidat: string;
  NbHeureDemAccVAEInd: number;
  CoutHeureDemAccVAEInd: number;
  NbHeureDemAccVAEColl: number;
  CoutHeureDemAccVAEColl: number;
  ActeFormatifComplémentaire_FormationObligatoire: string;
  NbHeureDemComplFormObligatoire: number;
  CoutHeureDemComplFormObligatoire: number;
  ActeFormatifComplémentaire_SavoirsDeBase: string;
  NbHeureDemComplFormSavoirsDeBase: number;
  CoutHeureDemComplFormSavoirsDeBase: number;
  ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: string;
  NbHeureDemComplFormBlocDeCompetencesCertifiant: number;
  CoutHeureDemComplFormBlocDeCompetencesCertifiant: number;
  ActeFormatifComplémentaire_Autre: string;
  NbHeureDemTotalActesFormatifs: number;
  NbHeureDemJury: number;
  CoutHeureJury: number;
  CoutTotalDemande: number;
}
