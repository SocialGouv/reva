import { LegalStatus, Organism } from "@prisma/client";
import { addDays } from "date-fns";

const ASSOCIATION_LOI_1901: LegalStatus = "ASSOCIATION_LOI_1901";
const DATE_NOW = new Date();
const DATE_NEXT_WEEK = addDays(DATE_NOW, 7);
const DEFAULT_SIRET = "50382357770000";
const DEFAULT_DOMAIN = "EXAMPLE.COM";
const DEFAULT_PHONE = "0123456789";

// Base organism object with common properties
const BASE_ORGANISM: Organism = {
  id: "00000000-0000-0000-0000-000000000000",
  label: "BASE_ORGANISM",
  legalStatus: ASSOCIATION_LOI_1901,
  llToEarth: "(1234.56, 7890.12, 3456.78)",
  contactAdministrativeEmail: "contact@example.com",
  contactAdministrativePhone: DEFAULT_PHONE,
  siret: DEFAULT_SIRET,
  isActive: true,
  createdAt: DATE_NOW,
  updatedAt: null,
  typology: "expertFiliere",
  qualiopiCertificateExpiresAt: DATE_NEXT_WEEK,
  website: "https://example.com",
  organismInformationsCommercialesId: null,
  maisonMereAAPId: null,
  fermePourAbsenceOuConges: false,
  isOnSite: false,
  isRemote: true,
  isHeadAgency: true,
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
};

export const EXPERT_FILIERE_ORGANISM: Organism = {
  ...BASE_ORGANISM,
  id: "00000000-0000-0000-0000-000000000004",
  label: "EXPERT_FILIERE_ORGANISM",
  contactAdministrativeEmail: `EXPERT.FILIERE@${DEFAULT_DOMAIN}`,
  typology: "expertFiliere",
  website: `https://EXPERT-FILIERE.${DEFAULT_DOMAIN}`,
};

export const EXPERT_BRANCHE_ORGANISM: Organism = {
  ...BASE_ORGANISM,
  id: "00000000-0000-0000-0000-000000000005",
  label: "EXPERT_BRANCHE_ORGANISM",
  contactAdministrativeEmail: `EXPERT.BRANCHE@${DEFAULT_DOMAIN}`,
  typology: "expertBranche",
  website: `https://EXPERT-BRANCHE.${DEFAULT_DOMAIN}`,
};

export const ORGANISM_EXPERIMENTATION: Organism = {
  ...BASE_ORGANISM,
  id: "00000000-0000-0000-0000-000000000001",
  label: "EXPERIMENTATION_ORGANISM",
  contactAdministrativeEmail: `EXPERIMENTATION@${DEFAULT_DOMAIN}`,
  typology: "experimentation",
  modaliteAccompagnement: "LIEU_ACCUEIL",
  website: `https://EXPERIMENTATION.${DEFAULT_DOMAIN}`,
};

export const EXPERT_BRANCHE_ET_FILIERE_ORGANISM: Organism = {
  ...BASE_ORGANISM,
  id: "00000000-0000-0000-0000-000000000002",
  label: "EXPERT_BRANCHE_ET_FILIERE_ORGANISM",
  contactAdministrativeEmail: `EXPERT.BRANCHE.ET.FILIERE@${DEFAULT_DOMAIN}`,
  typology: "expertBrancheEtFiliere",
  website: `https://EXPERT-BRANCHE-ET-FILIERE.${DEFAULT_DOMAIN}`,
};
