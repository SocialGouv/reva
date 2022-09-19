export interface Certification {
  id: string;
  description: string;
  codeRncp: string;
  summary: string;
  label: string;
  activities?: string;
  abilities?: string;
  activityArea?: string;
  accessibleJobType?: string;
  status: "AVAILABLE" | "SOON";
}

export interface Contact {
  phone: null | string;
  email: null | string;
}

export type duration =
  | "unknown"
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears"
  | "moreThanFiveYears"
  | "moreThanTenYears";

export interface Experience {
  id?: string;
  title: string;
  startedAt: Date;
  description: string;
  duration: duration;
}

export interface Experiences {
  edited?: Experience;
  rest: Experience[];
}

export interface Goal {
  checked: boolean;
  id: string;
  label: string;
}

export interface Region {
  id: string;
  code: string;
  label: string;
}

export interface Organism {
  id: string;
  address: string;
  city: string;
  contactAdministrativeEmail: string;
  label: string;
  zip: string;
}

export interface OrganismForCandidacy {
  candidacyId: string;
  selectedOrganismId: string;
}

export interface TrainingProgram {
  appointmentCount: number;
  individualHourCount: number;
  collectiveHourCount: number;
  additionalHourCount: number;
  validatedByCandidate: boolean;
  certificateSkills: string;
  otherTraining: string;
}
