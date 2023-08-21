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
  status: "AVAILABLE" | "SOON" | "INACTIVE";
}

export interface Contact {
  firstname: null | string;
  lastname: null | string;
  phone: null | string;
  email: null | string;
  departmentId: null | string;
}

export type duration =
  | "unknown"
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears"
  | "moreThanFiveYears"
  | "moreThanTenYears";

export type candidacyStatus =
  | "CANDIDATURE_VIDE"
  | "CANDIDATURE_VALIDEE"
  | "ARCHIVE"
  | "PROJET" // TODO: migrate to CANDIDATURE_INCOMPLETE
  | "VALIDATION" // TODO: migrate to CANDIDATURE_SOUMISE
  | "PRISE_EN_CHARGE" // TODO: migrate to CANDIDATURE_PRISE_EN_CHARGE
  | "PARCOURS_ENVOYE"
  | "PARCOURS_CONFIRME";

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

export interface Department {
  id: string;
  code: string;
  label: string;
}

export interface Organism {
  id: string;
  contactAdministrativeEmail: string;
  contactAdministrativePhone: string | null;
  label: string;
  organismOnDepartments?: OrganismOnDepartment[];
}

export interface OrganismOnDepartment {
  id: string;
  isRemote: boolean;
  isOnSite: boolean;
}

export interface OrganismForCandidacy {
  candidacyId: string;
  selectedOrganismId: string;
}

export interface TrainingProgram {
  additionalHourCount: number;
  appointmentCount: number;
  basicSkills: string[];
  certificateSkills: string;
  collectiveHourCount: number;
  individualHourCount: number;
  mandatoryTrainings: string[];
  otherTraining: string;
}

export type Page<T> = {
  rows: T[];
  info: {
    totalRows: number;
    currentPage: number;
    totalPages: number;
    pageLength: number;
  };
};
