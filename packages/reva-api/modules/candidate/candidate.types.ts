import { Country } from "@prisma/client";
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

export type CANDIDATE_LOGIN_ACTION = "registration" | "login" | "confirmEmail";

export interface CandidateRegistrationInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  departmentId: string;
  certificationId?: string;
  action: "registration";
}

export interface CandidateLoginInput {
  email: string;
  action: "login";
}

export interface CandidateConfirmEmailInput {
  previousEmail: string;
  newEmail: string;
  action: "confirmEmail";
}

export type CandidateAuthenticationInput =
  | CandidateRegistrationInput
  | CandidateLoginInput
  | CandidateConfirmEmailInput;

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

export interface CandidateUpdateInput {
  id: string;
  gender: Gender;
  email: string;
  phone: string;
  firstname: string;
  firstname2?: string;
  firstname3?: string;
  lastname: string;
  givenName?: string;
  birthdate: string;
  birthCity: string;
  birthDepartmentId: string;
  countryId: Country["id"];
  nationality: string;
  socialSecurityNumber: string;
  street: string;
  zip: string;
  city: string;
}

export interface CandidateProfileUpdateInput {
  candidateId: string;
  highestDegreeId: string;
  highestDegreeLabel: string;
  niveauDeFormationLePlusEleveDegreeId: string;
}
