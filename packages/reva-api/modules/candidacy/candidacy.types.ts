import { CandidacyStatusStep } from "@prisma/client";

import { Organism } from "../organism/organism.types";
import {
  Department,
  DropOutReason,
  Region,
  ReorientationReason,
} from "../referential/referential.types";

interface CandidacyAbstract {
  deviceId: string;

  // companionId: string | null;
  experiences: Experience[];
  goals: Goal[];
  email: string | null;
}

export interface CandidacyInput extends CandidacyAbstract {
  certificationId: string;
}

export interface CandidacyDropOut {
  droppedOutAt: Date;
  status: CandidacyStatusStep;
  dropOutReason: DropOutReason;
  otherReasonContent?: string | null;
}

export interface CandidacyConventionCollective {
  id: string;
  idcc: string;
  label: string;
}

export interface Candidacy extends CandidacyAbstract {
  id: string;
  certificationId?: string;
  certification?: any;
  isCertificationPartial?: boolean | null;
  organism?: Organism | null;
  regionId?: string;
  region?: Region;
  department: Department | null;
  candidacyStatuses: CandidacyStatus[];
  // basicSkills: BasicSkill[];
  // trainings: Training[];
  //   individualHourCount: number | null;
  //   collectiveHourCount: number | null;
  candidacyDropOut?: CandidacyDropOut | null;
  reorientationReason?: ReorientationReason | null;
  createdAt: Date;
  ccnId?: string | null;
  conventionCollective?: CandidacyConventionCollective | null;
}

export interface CandidacyStatus {
  id: string;
  status: string;
  createdAt: Date;
  isActive: boolean;
}

export interface CandidacySummary
  extends Omit<
    Candidacy,
    | "experiences"
    | "goals"
    | "candidacyStatuses"
    | "regionId"
    | "region"
    | "certification"
  > {
  id: string;
  certification: CertificationSummary;
  lastStatus: CandidacyStatus;
  createdAt: Date;
}

export interface CertificationSummary {
  id: string;
  label: string;
}

export interface ExperienceInput {
  title: string;
  startedAt: Date;
  duration: Duration;
  description: string;
}

export interface Experience extends ExperienceInput {
  id: string;
}

export type Duration =
  | "unknown"
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears"
  | "moreThanFiveYears"
  | "moreThanTenYears";

export type CandidateTypology =
  | "NON_SPECIFIE"
  | "SALARIE_PRIVE"
  | "SALARIE_PUBLIC_HOSPITALIER"
  | "DEMANDEUR_EMPLOI"
  | "AIDANTS_FAMILIAUX"
  | "AUTRE";

export interface Goal {
  goalId: string;
  additionalInformation: string | null;
}

export interface Companion {
  id: string;
}

export interface AppointmentInformations {
  firstAppointmentOccuredAt: Date;
}

export interface BasicSkill {
  id: string;
  label: string;
}

export interface Training {
  id: string;
  label: string;
}

export interface Admissibility {
  id: string;
  isCandidateAlreadyAdmissible: boolean;
  reportSentAt: Date | null;
  certifierRespondedAt: Date | null;
  responseAvailableToCandidateAt: Date | null;
  status: AdmissibilityStatus | null;
}

export type AdmissibilityStatus = "ADMISSIBLE" | "NOT_ADMISSIBLE";

export enum CandidacyBusinessEvent {
  SUBMITTED_CANDIDACY = "Submitted Candidacy",
  TOOK_OVER_CANDIDACY = "Took over candidacy",
  UPDATED_CERTIFICATION = "Updated Certification",
  ADDED_EXPERIENCE = "Added experience",
  UPDATED_EXPERIENCE = "Updated experience",
  UPDATED_GOALS = "Updated goals",
  UPDATED_CONTACT = "Updated contact",
  DELETED_CANDIDACY = "Deleted candidacy",
  ARCHIVED_CANDIDACY = "Archived candidacy",
  UNARCHIVED_CANDIDACY = "Unarchived candidacy",
  UPDATED_APPOINTMENT_INFO = "Updated appointment info",
  SELECTED_ORGANISM = "Selected organism",
  SUBMITTED_TRAINING_FORM = "Submitted training form",
  CONFIRMED_TRAINING_FORM = "Confirmed training form",
  UPDATED_ADMISSIBILITY = "Updated admissibility",
  DROPPED_OUT_CANDIDACY = "Dropped out candidacy",
  CANCELED_DROPPED_OUT_CANDIDACY = "Canceled dropped out candidacy",
  UPDATED_EXAM_INFO = "Updated exam information",
  CREATED_FUNDING_REQUEST_UNIFVAE = "Created a funding request (unifvae)",
}

export interface ExamInfo {
  id: string;
  examResult: ExamResult | null;
  estimatedExamDate: Date | null;
  actualExamDate: Date | null;
}

export type ExamResult =
  | "SUCCESS"
  | "PARTIAL_SUCCESS"
  | "PARTIAL_CERTIFICATION_SUCCESS"
  | "FAILURE";

export type CandidacyStatusFilter =
  | "ACTIVE_HORS_ABANDON"
  | "ABANDON"
  | "REORIENTEE"
  | "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"
  | "PARCOURS_CONFIRME_HORS_ABANDON"
  | "PRISE_EN_CHARGE_HORS_ABANDON"
  | "PARCOURS_ENVOYE_HORS_ABANDON"
  | "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON"
  | "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON"
  | "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON"
  | "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON"
  | "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON"
  | "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON"
  | "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON"
  | "VALIDATION_HORS_ABANDON"
  | "PROJET_HORS_ABANDON";

export interface SearchOrganismFilter {
  distanceStatus?: string;
}
