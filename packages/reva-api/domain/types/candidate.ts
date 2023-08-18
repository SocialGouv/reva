import { Decimal } from "@prisma/client/runtime/library";

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
  departmentId: string;
}

export type Gender = "undisclosed" | "man" | "woman";

export type CANDIDATE_LOGIN_ACTION = "registration" | "login";

export interface CandidateRegistrationInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  departmentId: string;
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
  otherTrainingCost: Decimal;
  otherTrainingHourCount: number;
  postExamCost: Decimal;
  postExamHourCount: number;
  totalCost?: Decimal;
  companion: Organism | null;
  numAction: string;
}

export interface FundingRequestInformations {
  training: TrainingForm;
  fundingRequest: FundingRequest | null;
}

export enum CandidateBusinessEvent {
  CREATED_CANDIDATE = "Created Candidate",
}
