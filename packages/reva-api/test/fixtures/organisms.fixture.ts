import {
  LegalStatus,
  MaisonMereAAP,
  Organism,
  StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";
import { addDays } from "date-fns";

const ASSOCIATION_LOI_1901: LegalStatus = "ASSOCIATION_LOI_1901";
const DATE_NOW = new Date();
const DATE_NEXT_WEEK = addDays(DATE_NOW, 7);
const DEFAULT_SIRET = "50382357770000";
const DEFAULT_PHONE = "0123456789";

const MAISON_MERE_BASE: MaisonMereAAP = {
  id: "00000000-0000-0000-0000-000000000000",
  raisonSociale: "Maison Mere Base",
  statutJuridique: ASSOCIATION_LOI_1901,
  siret: DEFAULT_SIRET,
  phone: "0612345678",
  typologie: "expertFiliere",
  siteWeb: "https://www.iperia.fr",
  dateExpirationCertificationQualiopi: DATE_NOW,
  cguVersion: 1,
  cguAcceptedAt: DATE_NOW,
  managerFirstname: "John",
  managerLastname: "Doe",
  showAccountSetup: true,
  isActive: true,
  isSignalized: false,
  gestionnaireAccountId: "00000000-0000-0000-0000-000000000001",
  createdAt: DATE_NOW,
  updatedAt: DATE_NOW,
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_JOUR,
  isMCFCompatible: true,
};

export const MAISON_MERE_AAP_EXPERT_FILIERE: MaisonMereAAP = {
  ...MAISON_MERE_BASE,
  id: "00000000-0000-0000-0000-000000000020",
  raisonSociale: "Maison Mere ExpertFiliere",
  siret: "13002526500013",
};

export const MAISON_MERE_AAP_EXPERT_BRANCHE: MaisonMereAAP = {
  ...MAISON_MERE_BASE,
  id: "00000000-0000-0000-0000-000000000021",
  siret: "12000015300029",
  raisonSociale: "Maison Mere ExpertBranche",
  typologie: "expertBranche",
};

export const MAISON_MERE_AAP_A_METTRE_A_JOUR: MaisonMereAAP = {
  ...MAISON_MERE_BASE,
  id: "00000000-0000-0000-0000-000000000019",
  siret: "11000015300029",
  raisonSociale: "Maison Mere A Mettre A Jour",
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_METTRE_A_JOUR,
};

const ORGANISM_BASE: Organism = {
  id: "00000000-0000-0000-0000-000000000000",
  label: "ORGANISM_BASE",
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
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
};

export const ORGANISM_EXPERT_FILIERE: Organism = {
  ...ORGANISM_BASE,
  id: "00000000-0000-0000-0000-000000000004",
  label: "EXPERT_FILIERE",
  siret: "14002526500013",
};

export const ORGANISM_EXPERT_BRANCHE: Organism = {
  ...ORGANISM_BASE,
  id: "00000000-0000-0000-0000-000000000005",
  label: "EXPERT_BRANCHE",
  typology: "expertBranche",
  siret: "15000015300029",
};

export const ORGANISM_EXPERT_BRANCHE_ET_FILIERE: Organism = {
  ...ORGANISM_BASE,
  id: "00000000-0000-0000-0000-000000000002",
  label: "EXPERT_BRANCHE_ET_FILIERE",
  typology: "expertBrancheEtFiliere",
  siret: "16000015300029",
};

export const ORGANISM_EXPERIMENTATION: Organism = {
  ...ORGANISM_BASE,
  id: "00000000-0000-0000-0000-000000000001",
  label: "EXPERIMENTATION",
  typology: "experimentation",
  siret: "17000015300029",
};

export const ORGANISM_LIEU_ACCUEIL: Organism = {
  ...ORGANISM_BASE,
  id: "00000000-0000-0000-0000-000000000007",
  label: "Organism Lieu Accueil",
  modaliteAccompagnement: "LIEU_ACCUEIL",
  siret: "18000015300029",
};
