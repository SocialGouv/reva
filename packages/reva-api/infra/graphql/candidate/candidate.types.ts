import {
  Degree,
  VulnerabilityIndicator,
} from "../referential/referential.types";

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

export enum CandidateBusinessEvent {
  CREATED_CANDIDATE = "Created Candidate",
}
