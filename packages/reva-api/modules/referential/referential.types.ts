export const CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID =
  "a0d5b35b-06bb-46dd-8cf5-fbba5b01c711";

export interface Degree {
  id: string;
  code: string;
  label: string;
  level: number;
}

export interface DropOutReason {
  id: string;
  label: string;
}

export const CertificationStatus = {
  INACTIVE: "INACTIVE",
  SOON: "SOON",
  AVAILABLE: "AVAILABLE",
};

export type CertificationStatus =
  (typeof CertificationStatus)[keyof typeof CertificationStatus];

export interface Certification {
  id: string;
  label: string;
  summary: string | null;
  level: number;
  activities: string | null;
  activityArea: string | null;
  accessibleJobType: string | null;
  abilities: string | null;
  codeRncp: string;
  status: CertificationStatus;
}

export interface Region {
  id: string;
  code: string;
  label: string;
}

export interface VulnerabilityIndicator {
  id: string;
  label: string;
}

export interface ReorientationReason {
  id: string;
  label: string;
  createdAt: Date;
  updatedAt: Date | null;
  disabled: boolean;
}

export interface UpdateCertificationInput {
  certificationId: string;
  label: string;
  level: number;
  codeRncp: string;
  conventionCollectiveIds: string[];
  availableAt: Date;
  expiresAt: Date;
}

export interface CompetenceInput {
  id?: string;
  index: number;
  label: string;
}

interface CompetenceBlocInput {
  id?: string;
  label: string;
  isOptional?: boolean;
  competences: CompetenceInput[];
}

export interface UpdateCompetenceBlocsInput {
  certificationId: string;
  blocs: CompetenceBlocInput[];
}

export interface UpdateCompetenceBlocInput {
  id: string;
  label: string;
  competences: CompetenceInput[];
}

export interface CreateCompetenceBlocInput {
  certificationId: string;
  label: string;
  competences: CompetenceInput[];
}
