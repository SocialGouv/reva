export interface Organism {
  id: string;
  label: string;
  address: string;
  zip: string;
  city: string;
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
}

export type OrganismTypology =
  | "experimentation"
  | "generaliste"
  | "expertFiliere"
  | "expertBranche"
  | "expertBrancheEtFiliere";

export interface DepartmentWithOrganismMethods {
  departmentId: string;
  isOnSite: boolean;
  isRemote: boolean;
}

type ConformiteNormeAccessibilite =
  | "CONFORME"
  | "NON_CONFORME"
  | "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC";

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

export interface MaisonMereAAP {
  id: string;
  raisonSociale: string;
  statutJuridique: LegalStatus;
  siret: string;
  adresse: string;
  codePostal: string;
  ville: string;
  typologie: OrganismTypology;
  siteWeb: string;
  dateExpirationCertificationQualiopi: Date;
  gestionnaireAccountId: string;
}

export interface MaisonMereAAPOnDepartement {
  departementId: string;
  estSurplace: boolean;
  estADistance: boolean;
}
