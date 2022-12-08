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
  totalCost?: number;
}

export interface FundingRequestInformations {
  training: TrainingForm;
  fundingRequest: FundingRequest | null;
}
