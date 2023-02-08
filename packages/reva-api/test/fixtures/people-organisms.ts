import { Account, Candidate, Organism } from "@prisma/client";
import { randomUUID } from "crypto";

// Candidates

export const candidateJPL_kcId = randomUUID();
export const candidateJPL: Candidate = {
    id: candidateJPL_kcId,
    firstname: "Jean-Patrick",
    lastname: "Ledru",
    email: "jean-pat.ledru@gmail.com",
    gender: "man",
    keycloakId: candidateJPL_kcId,
    firstname2: "",
    firstname3: "",
    phone: "",
    highestDegreeId: null,
    vulnerabilityIndicatorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const candidateMPB_kcId = randomUUID();
export const candidateMPB: Candidate = {
    id: candidateMPB_kcId,
    firstname: "Marie-Paule",
    lastname: "Belle",
    email: "mpb@gmail.com",
    gender: "woman",
    keycloakId: candidateMPB_kcId,
    firstname2: "",
    firstname3: "",
    phone: "",
    highestDegreeId: null,
    vulnerabilityIndicatorId: null,
    createdAt: new Date(),
    updatedAt: null,
};

// Organisms

export const organismIperiaId = randomUUID();
export const organismIperia: Organism = {
    id: organismIperiaId,
    label: "Iperia",
    siret: "5038235679",
    address: "123 rue tabaga",
    city: "Paris",
    zip: "75017",
    contactCommercialName: "Manu",
    contactCommercialEmail: "manu@iperia.fr",
    contactAdministrativeEmail: "josette@iperia.fr",
    isActive: true,
    createdAt: new Date(),
    updatedAt: null,
}

// Architectes

export const archiIperia1KcId = randomUUID();
export const archiIperia1: Account = {
    id: randomUUID(),
    keycloakId: archiIperia1KcId,
    firstname: "Gérard",
    lastname: "Jambon",
    email: "gege.bonbon@gmail.com",
    organismId: organismIperiaId,
}

export const archiIperia2KcId = randomUUID();
export const archiIperia2: Account = {
    id: randomUUID(),
    keycloakId: archiIperia2KcId,
    firstname: "Antoine",
    lastname: "Camembert",
    email: "toinou.kipu@hotmail.fr",
    organismId: organismIperiaId,
}

// Admins

export const adminAccount1KcId = randomUUID();
export const adminAccount1: Account = {
    id: randomUUID(),
    keycloakId: adminAccount1KcId,
    firstname: "Mimi",
    lastname: "Matty",
    email: "mimi@yolo.fr",
    organismId: organismIperiaId,
}
