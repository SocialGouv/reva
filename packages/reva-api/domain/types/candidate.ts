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
  diagnosisHourCount: number;
  diagnosisCost: number;
  postExamCost: number;
  individualCost: number;
  collectiveCost: number;
  basicSkillsCost: number;
  certificateSkillsCost: number;
  mandatoryTrainingsHourCount: number;
  basicSkillsHourCount: number;
  certificateSkillsHourCount: number;
  examHourCount: number;
  id: string;
  candidacyId: string;
  individualHourCount: number;
  collectiveHourCount: number;
  basicSkills: any;
  mandatoryTrainings: any;
  otherTraining: string;
}

export interface FundingRequestInformations {
  training: TrainingForm;
  fundingRequest: FundingRequest | null;
}
