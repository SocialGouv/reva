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
