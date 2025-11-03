import {
  CertificationJuryFrequency,
  CertificationJuryTypeOfModality,
} from "@prisma/client";

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

const CertificationStatus = {
  BROUILLON: "BROUILLON",
  A_VALIDER_PAR_CERTIFICATEUR: "A_VALIDER_PAR_CERTIFICATEUR",
  VALIDE_PAR_CERTIFICATEUR: "VALIDE_PAR_CERTIFICATEUR",
  INACTIVE: "INACTIVE",
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
  visible: boolean | null;
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

export interface CompetenceInput {
  id?: string;
  index: number;
  label: string;
}

interface CompetenceBlocInput {
  id?: string;
  label: string;
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

export interface UpdateCertificationStructureAndCertificationAuthoritiesInput {
  certificationId: string;
  certificationAuthorityStructureId: string;
  certificationAuthorityIds: string[];
}

export interface SendCertificationToRegistryManagerInput {
  certificationId: string;
}

export interface ResetCompetenceBlocsByCertificationIdInput {
  certificationId: string;
}

export interface UpdateCertificationPrerequisitesInput {
  certificationId: string;
  prerequisites: { label: string; index: number }[];
}

export interface UpdateCertificationDescriptionInput {
  certificationId: string;
  juryTypeMiseEnSituationProfessionnelle?: CertificationJuryTypeOfModality;
  juryTypeSoutenanceOrale?: CertificationJuryTypeOfModality;
  juryFrequency?: CertificationJuryFrequency;
  juryFrequencyOther?: string;
  juryPlace?: string;
  juryEstimatedCost: number;
  availableAt: Date;
}

export interface ValidateCertificationInput {
  certificationId: string;
}

interface CertificationAdditionalInfo {
  linkToReferential: string;
  linkToCorrespondenceTable?: string;
  dossierDeValidationTemplate?: GraphqlUploadedFile;
  dossierDeValidationLink?: string;
  linkToJuryGuide?: string;
  certificationExpertContactDetails?: string;
  certificationExpertContactPhone?: string;
  certificationExpertContactEmail?: string;
  usefulResources?: string;
  commentsForAAP?: string;
  additionalDocuments: GraphqlUploadedFile[];
}

export interface UpdateCertificationAdditionalInfoInput {
  certificationId: string;
  additionalInfo: CertificationAdditionalInfo;
}

export interface ReplaceCertificationInput {
  codeRncp: string;
  certificationId: string;
}
