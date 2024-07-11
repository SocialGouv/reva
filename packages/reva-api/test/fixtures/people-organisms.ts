import { randomUUID } from "crypto";

import { Gender } from "@prisma/client";

// Candidates

const candidateJPL = {
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
};

const expertFiliereOrganism = {
  label: "Expert filiere organism",
  siret: "5038235777",
  contactAdministrativeEmail: "expertFiliereOrganism@example.com",
  isActive: true,
  typology: "expertFiliere" as const,
};

const expertBrancheOrganism = {
  label: "Expert branch organism",
  siret: "5038235777",
  contactAdministrativeEmail: "expertBranche@example.com",
  isActive: true,
  typology: "expertBranche" as const,
};

const expertBrancheEtFiliereOrganism = {
  label: "Expert branch organism",
  siret: "5038235777",
  contactAdministrativeEmail: "expertBrancheEtFiliere@example.com",
  isActive: true,
  typology: "expertBrancheEtFiliere" as const,
};

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

const gestionaMaisonMereAapAccount1  = {
  id: randomUUID(),
  keycloakId: randomUUID(),
  firstname: "Peter",
  lastname: "Griffin",
  email: "peter@yolo.fr",
};

const gestionaMaisonMereAapAccount2  = {
  id: randomUUID(),
  keycloakId: randomUUID(),
  firstname: "Marge",
  lastname: "Simpson",
  email: "marge@yolo.fr",
};

const maisonMereAAP1 = {
  phone: "0612345678",
  raisonSociale: "Maison Mere Organism Iperia",
  siteWeb: "https://www.iperia.fr",
  siret: "5038235679",
  statutJuridique: "ASSOCIATION_LOI_1901" as const,
  typologie: "expertFiliere" as const,
  dateExpirationCertificationQualiopi: new Date(),
  // gestionnaireAccountId: account.id,
  statutValidationInformationsJuridiquesMaisonMereAAP: "A_JOUR" as const,
  cguVersion: null,
  cguAcceptedAt: null,
  managerFirstname: "Josette",
  managerLastname: "Ledru",
  showAccountSetup: true,
}

export {
  adminAccount1,
  gestionaMaisonMereAapAccount1,
  gestionaMaisonMereAapAccount2,
  archiIperia1,
  archiIperia2,
  candidateJPL,
  candidateMPB,
  expertBrancheEtFiliereOrganism,
  expertBrancheOrganism,
  expertFiliereOrganism,
  organismIperia,
  maisonMereAAP1,
};
