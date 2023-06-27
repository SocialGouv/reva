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
};

const organismDummy1 = {
  label: "Dummyperia",
  siret: "5038235666",
  address: "4 place Thiers",
  city: "Bondy",
  zip: "93140",
  contactAdministrativeEmail: "bunny@dummyperia.fr",
  isActive: true,
  typology: "generaliste" as const,
};

const organismDummy2 = {
  label: "Dummyperia2",
  siret: "5038235777",
  address: "14 boulevard Ney",
  city: "Nantes",
  zip: "44000",
  contactAdministrativeEmail: "elmer@foodbeat.fr",
  isActive: true,
  typology: "generaliste" as const,
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
  organismIperia,
  organismDummy1,
  organismDummy2,
  candidateJPL,
  candidateMPB,
  archiIperia1,
  archiIperia2,
  adminAccount1,
};
