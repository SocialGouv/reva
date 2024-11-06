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

export interface CreateLieuAccueilInfoInput {
  nom: string;
  adresseNumeroEtNomDeRue: string;
  adresseInformationsComplementaires?: string;
  adresseCodePostal: string;
  adresseVille: string;
  emailContact: string;
  telephone: string;
  siteInternet?: string;
  conformeNormesAccessibilite: ConformiteNormeAccessibilite;
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

export type UpdateMaisonMereLegalInformationInput = {
  maisonMereAAPId: string;
  siret: string;
  statutJuridique: LegalStatus;
  raisonSociale: string;
  managerFirstname: string;
  managerLastname: string;
  gestionnaireFirstname: string;
  gestionnaireLastname: string;
  gestionnaireEmail: string;
  phone: string;
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
