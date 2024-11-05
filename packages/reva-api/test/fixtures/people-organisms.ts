import { randomUUID } from "crypto";

import {
  Gender,
  Organism,
  StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";

// Candidates

const candidateJPL = {
  id: randomUUID(),
  firstname: "Jean-Patrick",
  lastname: "Ledru",
  email: "jean-pat.ledru@gmail.com",
  gender: "man" as Gender,
  keycloakId: randomUUID(),
  firstname2: "",
  firstname3: "",
  phone: "",
  highestDegreeId: null,
  vulnerabilityIndicatorId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const candidateMPB = {
  firstname: "Marie-Paule",
  lastname: "Belle",
  email: "mpb@gmail.com",
  gender: "woman" as Gender,
  keycloakId: randomUUID(),
  firstname2: "",
  firstname3: "",
  phone: "",
  highestDegreeId: null,
  vulnerabilityIndicatorId: null,
  createdAt: new Date(),
  updatedAt: null,
};

// Organisms

const organismIperia = {
  label: "Iperia",
  siret: "5038235679",
  contactAdministrativeEmail: "josette@iperia.fr",
  isActive: true,
  typology: "experimentation" as const,
  llToEarth: "(4622585.927620327, 437370.0268140378, 4372806.174258723)",
  modaliteAccompagnement: "LIEU_ACCUEIL",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

const expertFiliereOrganism = {
  id: randomUUID(),
  label: "Expert filiere organism",
  siret: "5038235777",
  contactAdministrativeEmail: "expertFiliereOrganism@example.com",
  isActive: true,
  typology: "expertFiliere" as const,
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

const expertBrancheOrganism = {
  label: "Expert branch organism",
  siret: "5038235777",
  contactAdministrativeEmail: "expertBranche@example.com",
  isActive: true,
  typology: "expertBranche" as const,
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

const expertBrancheEtFiliereOrganism = {
  label: "Expert branch organism",
  siret: "5038235777",
  contactAdministrativeEmail: "expertBrancheEtFiliere@example.com",
  isActive: true,
  typology: "expertBrancheEtFiliere" as const,
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

const agencePrincipaleMaisonMere2 = {
  id: randomUUID(),
  siret: "",
  label: "Agence principale Maison Mere 2",
  contactAdministrativeEmail: "distanciel.m2@example.com",
  isActive: true,
  typology: "expertBranche" as const,
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

const lieuAccueilMaisonMere2 = {
  id: randomUUID(),
  siret: "",
  label: "Lieu Accueil Maison Mere 2",
  contactAdministrativeEmail: "presentiel.m2@example.com",
  isActive: true,
  typology: "expertBranche" as const,
  modaliteAccompagnement: "LIEU_ACCUEIL",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

// Architectes

const archiIperia1 = {
  keycloakId: randomUUID(),
  firstname: "Gérard",
  lastname: "Jambon",
  email: "gege.bonbon@gmail.com",
};

const archiIperia2 = {
  keycloakId: randomUUID(),
  firstname: "Antoine",
  lastname: "Camembert",
  email: "toinou.kipu@hotmail.fr",
};

// Admins

const adminAccount1 = {
  keycloakId: randomUUID(),
  firstname: "Mimi",
  lastname: "Matty",
  email: "mimi@yolo.fr",
};

const gestionnaireMaisonMereAAP1 = {
  id: randomUUID(),
  keycloakId: randomUUID(),
  firstname: "Peter",
  lastname: "Griffin",
  email: "peter@yolo.fr",
};

const gestionnaireMaisonMereAAP2 = {
  id: randomUUID(),
  keycloakId: randomUUID(),
  firstname: "Marge",
  lastname: "Simpson",
  email: "marge@yolo.fr",
};

const collaborateurMaisonMereAapAccount2 = {
  id: randomUUID(),
  keycloakId: randomUUID(),
  firstname: "Alice",
  lastname: "Doe",
  email: "alice.doe.m2@example.com",
};

const maisonMereAAP1 = {
  id: randomUUID(),
  phone: "0612345678",
  raisonSociale: "Maison Mere Organism1",
  siteWeb: "https://www.iperia.fr",
  siret: "13002526500013",
  statutJuridique: "ASSOCIATION_LOI_1901" as const,
  typologie: "expertFiliere" as const,
  dateExpirationCertificationQualiopi: new Date(),
  // gestionnaireAccountId: account.id,
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_JOUR,
  cguVersion: null,
  cguAcceptedAt: null,
  managerFirstname: "Josette",
  managerLastname: "Ledru",
  showAccountSetup: true,
  isActive: true,
};

const maisonMereAAP2 = {
  ...maisonMereAAP1,
  id: randomUUID(),
  siret: "12000015300029",
  raisonSociale: "Maison Mere Organism2",
  managerFirstname: "Alice",
  managerLastname: "Doe",
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_METTRE_A_JOUR,
};

const maisonMereAAPExpertFiliere = {
  id: randomUUID(),
  phone: "0612345678",
  raisonSociale: "Maison Mere ExpertFiliere",
  siteWeb: "https://www.iperia.fr",
  siret: "13002526500013",
  statutJuridique: "ASSOCIATION_LOI_1901" as const,
  typologie: "expertFiliere" as const,
  dateExpirationCertificationQualiopi: new Date(),
  // gestionnaireAccountId: account.id,
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_JOUR,
  cguVersion: null,
  cguAcceptedAt: null,
  managerFirstname: "Josette",
  managerLastname: "Ledru",
  showAccountSetup: true,
  isActive: true,
};

const maisonMereAAPExpertBranche = {
  ...maisonMereAAPExpertFiliere,
  id: randomUUID(),
  siret: "12000015300029",
  raisonSociale: "Maison Mere ExpertBranche",
  managerFirstname: "Alice",
  managerLastname: "Doe",
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_METTRE_A_JOUR,
  typologie: "expertBranche" as const,
};

export {
  adminAccount1,
  gestionnaireMaisonMereAAP1,
  gestionnaireMaisonMereAAP2,
  archiIperia1,
  archiIperia2,
  candidateJPL,
  candidateMPB,
  expertBrancheEtFiliereOrganism,
  expertBrancheOrganism,
  expertFiliereOrganism,
  organismIperia,
  maisonMereAAP1,
  maisonMereAAP2,
  agencePrincipaleMaisonMere2,
  lieuAccueilMaisonMere2,
  collaborateurMaisonMereAapAccount2,
  maisonMereAAPExpertFiliere,
  maisonMereAAPExpertBranche,
};
