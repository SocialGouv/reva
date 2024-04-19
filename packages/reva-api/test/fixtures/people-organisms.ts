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
  address: "123 rue tabaga",
  city: "Paris",
  zip: "75017",
  contactAdministrativeEmail: "josette@iperia.fr",
  isActive: true,
  typology: "experimentation" as const,
  ll_to_earth: "(4622585.927620327, 437370.0268140378, 4372806.174258723)",
};

const generalisteOrganism = {
  label: "Generaliste organism",
  siret: "5038235666",
  address: "4 place Thiers",
  city: "Bondy",
  zip: "93140",
  contactAdministrativeEmail: "generalisteOrganism@example.com",
  isActive: true,
  typology: "generaliste" as const,
};

const expertFiliereOrganism = {
  label: "Expert filiere organism",
  siret: "5038235777",
  address: "14 boulevard Ney",
  city: "Nantes",
  zip: "44000",
  contactAdministrativeEmail: "expertFiliereOrganism@example.com",
  isActive: true,
  typology: "expertFiliere" as const,
};

const expertBrancheOrganism = {
  label: "Expert branch organism",
  siret: "5038235777",
  address: "14 boulevard Ney",
  city: "Nantes",
  zip: "44000",
  contactAdministrativeEmail: "expertBranche@example.com",
  isActive: true,
  typology: "expertBranche" as const,
};

const expertBrancheEtFiliereOrganism = {
  label: "Expert branch organism",
  siret: "5038235777",
  address: "14 boulevard Ney",
  city: "Nantes",
  zip: "44000",
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

export {
  adminAccount1,
  archiIperia1,
  archiIperia2,
  candidateJPL,
  candidateMPB,
  expertBrancheEtFiliereOrganism,
  expertBrancheOrganism,
  expertFiliereOrganism,
  generalisteOrganism,
  organismIperia,
};
