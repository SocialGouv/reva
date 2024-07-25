export interface Organism {
  id: string;
  label: string;
  siret: string;
  legalStatus?: LegalStatus;
  contactAdministrativeEmail: string;
  contactAdministrativePhone: string | null;
  website: string | null;
  isActive: boolean;
  typology: OrganismTypology;
  qualiopiCertificateExpiresAt: Date | null;
  fermePourAbsenceOuConges: boolean;
  maisonMereAAPId: string | null;
  llToEarth: string | null;
  distanceKm?: number;
}

export type OrganismTypology =
  | "experimentation"
  | "expertFiliere"
  | "expertBranche"
  | "expertBrancheEtFiliere";

type ConformiteNormeAccessibilite =
  | "CONFORME"
  | "NON_CONFORME"
  | "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC";

// type StatutValidationInformationsJuridiquesMaisonMereAAP =
// "A_METTRE_A_JOUR" | "EN_ATTENTE_DE_VERIFICATION" | "A_JOUR"

type LegalInformationValidationDecisionType = "VALIDE" | "DEMANDE_DE_PRECISION";

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

export interface MaisonMereAAPCGU {
  version?: number;
  acceptedAt?: Date;
}

export interface MaisonMereAAP {
  id: string;
  raisonSociale: string;
  statutJuridique: LegalStatus;
  siret: string;
  typologie: OrganismTypology;
  siteWeb: string;
  dateExpirationCertificationQualiopi: Date;
  gestionnaireAccountId: string;
  cgu: MaisonMereAAPCGU;
}

export interface CreateOrUpdateOrganismWithMaisonMereAAPDataRequest {
  nom: string;
  address: string;
  adresseInformationsComplementaires?: string;
  zip: string;
  city: string;
  contactAdministrativeEmail: string;
  contactAdministrativePhone?: string;
  website?: string;
  conformeNormesAccessbilite: ConformiteNormeAccessibilite;
  firstname: string;
  lastname: string;
  email: string;
  accountId?: string;
}

export interface CreateAgencyInput {
  nom: string;
  address: string;
  adresseInformationsComplementaires?: string;
  zip: string;
  city: string;
  contactAdministrativeEmail: string;
  contactAdministrativePhone?: string;
  website?: string;
  conformeNormesAccessbilite: ConformiteNormeAccessibilite;
  degreeIds: string[];
  domaineIds: string[];
}

export interface CreateOrganismAccountInput {
  organismId: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
}

export interface UpdateOrganimsAccountAndOrganismInput {
  organismId: string;
  accountId: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
}
export interface UpdateOrganismAccountInput {
  organismId: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
}

export interface UpdateMaisonMereAAPLegalValidationInput {
  maisonMereAAPId: string;
  decision: LegalInformationValidationDecisionType;
  internalComment?: string;
  aapComment?: string;
  aapUpdatedDocumentsAt: Date;
}

export type LegalInformationValidationDecisionInput = {
  decision: "VALIDE" | "DEMANDE_DE_PRECISION";
  internalComment: string;
  aapComment: string;
  aapUpdatedDocumentsAt: Date;
};

export type RemoteZone =
  | "FRANCE_METROPOLITAINE"
  | "GUADELOUPE"
  | "GUYANE"
  | "MARTINIQUE"
  | "MAYOTTE"
  | "LA_REUNION"
  | "SAINT_PIERRE_ET_MIQUELON"
  | "SAINTE_LUCIE_SAINT_MARTIN";
