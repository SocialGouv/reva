import { CandidacyStatusStep } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

interface CandidacyAbstract {
  deviceId: string;

  // companionId: string | null;
  experiences: Experience[];
  goals: Goal[];
  phone: string | null;
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

export interface Candidacy extends CandidacyAbstract {
  id: string;
  certificationId?: string;
  certification?: any;
  isCertificationPartial?: boolean;
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
  paymentRequest?: PaymentRequest | null;
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
  acronym: string;
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
  appointmentCount: number;
}

export interface Region {
  id: string;
  code: string;
  label: string;
}

export interface Department {
  id: string;
  code: string;
  label: string;
}

export type OrganismTypology =
  | "experimentation"
  | "generaliste"
  | "expertFiliere"
  | "expertBranche";

export interface DepartmentWithOrganismMethods {
  departmentId: string;
  isOnSite: boolean;
  isRemote: boolean;
}

export interface Organism {
  id: string;
  label: string;
  address: string;
  zip: string;
  city: string;
  siret: string;
  legalStatus?: LegalStatus;
  contactAdministrativeEmail: string;
  isActive: boolean;
  typology: OrganismTypology;
  qualiopiCertificateExpiresAt: Date | null;
}

export interface BasicSkill {
  id: string;
  label: string;
}

export interface Training {
  id: string;
  label: string;
}

export interface Degree {
  id: string;
  code: string;
  label: string;
  level: number;
}

export interface VulnerabilityIndicator {
  id: string;
  label: string;
}

export interface DropOutReason {
  id: string;
  label: string;
}

export interface ReorientationReason {
  id: string;
  label: string;
  createdAt: Date;
  updatedAt: Date | null;
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

export interface PaymentRequest {
  id: string;
  diagnosisEffectiveHourCount: number;
  diagnosisEffectiveCost: Decimal;
  postExamEffectiveHourCount: number;
  postExamEffectiveCost: Decimal;
  individualEffectiveHourCount: number;
  individualEffectiveCost: Decimal;
  collectiveEffectiveHourCount: number;
  collectiveEffectiveCost: Decimal;
  mandatoryTrainingsEffectiveHourCount: number;
  mandatoryTrainingsEffectiveCost: Decimal;
  basicSkillsEffectiveHourCount: number;
  basicSkillsEffectiveCost: Decimal;
  certificateSkillsEffectiveHourCount: number;
  certificateSkillsEffectiveCost: Decimal;
  otherTrainingEffectiveHourCount: number;
  otherTrainingEffectiveCost: Decimal;
  examEffectiveHourCount: number;
  examEffectiveCost: Decimal;
  invoiceNumber: string;
}

export interface PaymentRequestBatch {
  paymentRequestId: string;
  sent: boolean;
  batchFileName?: string;
  content?: PaymentRequestBatchContent;
}

export interface PaymentRequestBatchContent {
  NumAction: string;
  NumFacture: string;
  SiretAP: string;
  NbHeureReaJury: number;
  CoutHeureReaJury: number;
  NbHeureReaAPDiag: number;
  CoutHeureReaAPDiag: number;
  NbHeureReaAccVAEInd: number;
  CoutHeureReaAccVAEInd: number;
  NbHeureReaAPPostJury: number;
  CoutHeureReaAPPostJury: number;
  NbHeureReaAccVAEColl: number;
  CoutHeureReaAccVAEColl: number;
  NbHeureReaTotalActesFormatifs: number;
  NbHeureReaComplFormObligatoire: number;
  CoutHeureReaComplFormObligatoire: number;
  NbHeureReaComplFormSavoirsDeBase: number;
  CoutHeureReaComplFormSavoirsDeBase: number;
  NbHeureReaComplFormBlocDeCompetencesCertifiant: number;
  CoutHeureReaComplFormBlocDeCompetencesCertifiant: number;
  NBHeureReaActeFormatifComplémentaire_Autre: number;
  CoutHeureReaActeFormatifComplémentaire_Autre: number;
}

export interface FileUploadSpoolerEntry {
  destinationFileName: string;
  destinationPath: string;
  description: string;
  fileContent?: Buffer;
}

export enum CandidacyBusinessEvent {
  CREATED_CANDIDACY = "Created Candidacy",
  SUBMITTED_CANDIDACY = "Submitted Candidacy",
  TOOK_OVER_CANDIDACY = "Took over candidacy",
  UPDATED_CERTIFICATION = "Updated Certification",
  ADDED_EXPERIENCE = "Added experience",
  UPDATED_EXPERIENCE = "Updated experience",
  // DELETED_EXPERIENCE = "Deleted experience",
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
  UPDATED_EXAM_INFO = "Updated exam information",
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
