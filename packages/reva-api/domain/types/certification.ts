export const CertificationStatus = {
  INACTIVE: "INACTIVE",
  SOON: "SOON",
  AVAILABLE: "AVAILABLE",
};

export type CertificationStatus =
  typeof CertificationStatus[keyof typeof CertificationStatus];

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
