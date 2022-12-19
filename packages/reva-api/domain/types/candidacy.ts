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

export interface Candidacy extends CandidacyAbstract {
  id: string;
  certificationId?: string;
  certification?: any;
  organism?: Organism | null;
  regionId?: string;
  region?: Region;
  department: Department | null;
  candidacyStatuses: CandidacyStatus[];
  // basicSkills: BasicSkill[];
  // trainings: Training[];
  //   individualHourCount: number | null;
  //   collectiveHourCount: number | null;
  createdAt: Date;
}

export interface CandidacyStatus {
  id: string;
  status: string;
  createdAt: Date;
}

export interface CandidacySummary
  extends Omit<
    Candidacy,
    "experiences" | "goals" | "candidacyStatuses" | "regionId" | "region"
  > {
  id: string;
  lastStatus: CandidacyStatus;
  createdAt: Date;
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
  wasPresentAtFirstAppointment: boolean;
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

export interface Organism {
  id: string;
  label: string;
  address: string;
  zip: string;
  city: string;
  siret: string;
  contactAdministrativeEmail: string;
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
