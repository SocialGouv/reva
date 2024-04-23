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
  candidateId: string;
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
  | "ARCHIVE"
  | "PROJET" // TODO: migrate to CANDIDATURE_INCOMPLETE
  | "VALIDATION" // TODO: migrate to CANDIDATURE_SOUMISE
  | "PRISE_EN_CHARGE" // TODO: migrate to CANDIDATURE_PRISE_EN_CHARGE
  | "PARCOURS_ENVOYE"
  | "PARCOURS_CONFIRME"
  | "DOSSIER_FAISABILITE_ENVOYE"
  | "DOSSIER_FAISABILITE_RECEVABLE"
  | "DOSSIER_FAISABILITE_NON_RECEVABLE"
  | "DOSSIER_FAISABILITE_INCOMPLET"
  | "DOSSIER_DE_VALIDATION_ENVOYE"
  | "DOSSIER_DE_VALIDATION_SIGNALE"
  | "DEMANDE_FINANCEMENT_ENVOYE"
  | "DEMANDE_PAIEMENT_ENVOYEE";

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
  website?: string;
  organismOnDepartments?: OrganismOnDepartment[];
  informationsCommerciales?: OrganismInformationsCommerciales;
}

export interface OrganismInformationsCommerciales {
  id: string;
  organismId: string;
  nom: string | null;
  telephone: string | null;
  siteInternet: string | null;
  emailContact: string | null;
  adresseNumeroEtNomDeRue: string | null;
  adresseInformationsComplementaires: string | null;
  adresseCodePostal: string | null;
  adresseVille: string | null;
  conformeNormesAccessbilite: ConformiteNormeAccessibilite | null;
}

type ConformiteNormeAccessibilite =
  | "CONFORME"
  | "NON_CONFORME"
  | "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC";

export interface OrganismOnDepartment {
  id: string;
  departmentId: string;
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

export interface File {
  name: string;
  url: string;
}

export enum FeasibilityDecision {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ADMISSIBLE = "ADMISSIBLE",
  INCOMPLETE = "INCOMPLETE",
}

export interface Feasibility {
  id: string;
  feasibilityFileSentAt: Date;
  decision: FeasibilityDecision;
  decisionComment?: string;
  decisionSentAt?: Date;
  decisionFile?: File;
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
