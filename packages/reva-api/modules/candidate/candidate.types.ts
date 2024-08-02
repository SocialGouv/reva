import { Country, Department } from "@prisma/client";

import {
  Degree,
  VulnerabilityIndicator,
} from "../referential/referential.types";

export interface Candidate {
  id: string;
  keycloakId: string;
  gender?: Gender | null;
  email: string;
  firstname: string;
  firstname2?: string | null;
  firstname3?: string | null;
  lastname: string;
  givenName?: string | null;
  phone: string;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  departmentId: string;
  department?: Department;
  birthDepartmentId?: string | null;
  birthDepartment?: Department | null;
  birthdate?: Date | null;
  birthCity?: string | null;
  countryId?: string | null;
  country?: Country | null;
  nationality?: string | null;
  highestDegree?: Degree | null;
  highestDegreeLabel?: string | null;
  niveauDeFormationLePlusEleveDegreeId?: string | null;
  niveauDeFormationLePlusEleve?: Degree | null;
  highestDegreeId?: string | null;
  vulnerabilityIndicator?: VulnerabilityIndicator | null;
  vulnerabilityIndicatorId?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export type Gender = "undisclosed" | "man" | "woman";

export interface CandidateRegistrationInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  departmentId: string;
  certificationId?: string;
  action: "registration";
}

// eslint-disable-next-line
export interface CandidateLoginInput {
  email: string;
  action: "login";
}

interface CandidateConfirmEmailInput {
  previousEmail: string;
  newEmail: string;
  action: "confirmEmail";
}

export type CandidateAuthenticationInput =
  | CandidateRegistrationInput
  | CandidateLoginInput
  | CandidateConfirmEmailInput;

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
  departmentId?: string;
}

export interface CandidateProfileUpdateInput {
  candidateId: string;
  highestDegreeId: string;
  highestDegreeLabel: string;
  niveauDeFormationLePlusEleveDegreeId: string;
}
