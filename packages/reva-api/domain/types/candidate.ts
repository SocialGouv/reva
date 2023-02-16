import { Decimal } from "@prisma/client/runtime";

import { Degree, Organism } from "./candidacy";

export interface VulnerabilityIndicator {
  id: string;
  label: string;
}
export interface Candidate {
  firstname: string;
  firstname2?: string | null;
  firstname3?: string | null;
  lastname: string;
  email: string;
  phone: string;
  vulnerabilityIndicator?: VulnerabilityIndicator | null;
  gender?: Gender | null;
  highestDegree?: Degree | null;
}

export type Gender = "undisclosed" | "man" | "woman";

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
  basicSkillsCost: Decimal;
  basicSkillsHourCount: number;
  candidacyId: string;
  certificateSkills: string;
  certificateSkillsCost: Decimal;
  certificateSkillsHourCount: number;
  collectiveCost: Decimal;
  collectiveHourCount: number;
  diagnosisCost: Decimal;
  diagnosisHourCount: number;
  examCost: Decimal;
  examHourCount: number;
  id: string;
  individualCost: Decimal;
  individualHourCount: number;
  mandatoryTrainings: any;
  mandatoryTrainingsCost: Decimal;
  mandatoryTrainingsHourCount: number;
  otherTraining: string;
  postExamCost: Decimal;
  postExamHourCount: number;
  totalCost?: Decimal;
  companion: Organism | null;
  numAction: string;
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
  SiretAP: string;
  CertificationVisée: string;
  NomCandidat: string;
  PrenomCandidat1: string;
  PrenomCandidat2: string;
  PrenomCandidat3: string;
  NiveauObtenuCandidat: string;
  IndPublicFragile: "0" | "1" | "2" | "3";
  NbHeureDemAPDiag: number;
  CoutHeureDemAPDiag: number;
  NbHeureDemAPPostJury: number;
  CoutHeureDemAPPostJury: number;
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
}
