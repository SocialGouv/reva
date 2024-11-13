import {
  Organism,
  StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";

const agencePrincipaleMaisonMere2 = {
  id: "00000000-0000-0000-0000-000000000006",
  siret: "",
  label: "Agence principale Maison Mere 2",
  contactAdministrativeEmail: "distanciel.m2@example.com",
  isActive: true,
  typology: "expertBranche" as const,
  modaliteAccompagnement: "A_DISTANCE",
  modaliteAccompagnementRenseigneeEtValide: true,
} satisfies Partial<Organism>;

const lieuAccueilMaisonMere2 = {
  id: "00000000-0000-0000-0000-000000000007",
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
  keycloakId: "00000000-0000-0000-0000-000000000008",
  firstname: "Gérard",
  lastname: "Jambon",
  email: "gege.bonbon@gmail.com",
};

const archiIperia2 = {
  keycloakId: "00000000-0000-0000-0000-000000000009",
  firstname: "Antoine",
  lastname: "Camembert",
  email: "toinou.kipu@hotmail.fr",
};

// Admins

const adminAccount1 = {
  keycloakId: "00000000-0000-0000-0000-000000000010",
  firstname: "Mimi",
  lastname: "Matty",
  email: "mimi@yolo.fr",
};

const candidateAccount = {
  keycloakId: "00000000-0000-0000-0000-000000000011",
  firstname: "John",
  lastname: "Doe",
  email: "john.doe@example.fr",
};

const gestionnaireMaisonMereAAP1 = {
  id: "00000000-0000-0000-0000-000000000012",
  keycloakId: "00000000-0000-0000-0000-000000000013",
  firstname: "Peter",
  lastname: "Griffin",
  email: "peter@yolo.fr",
};

const gestionnaireMaisonMereAAP2 = {
  id: "00000000-0000-0000-0000-000000000014",
  keycloakId: "00000000-0000-0000-0000-000000000015",
  firstname: "Marge",
  lastname: "Simpson",
  email: "marge@yolo.fr",
};

const collaborateurMaisonMereAapAccount2 = {
  id: "00000000-0000-0000-0000-000000000016",
  keycloakId: "00000000-0000-0000-0000-000000000017",
  firstname: "Alice",
  lastname: "Doe",
  email: "alice.doe.m2@example.com",
};

const maisonMereAAP1 = {
  id: "00000000-0000-0000-0000-000000000018",
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
  id: "00000000-0000-0000-0000-000000000019",
  siret: "12000015300029",
  raisonSociale: "Maison Mere Organism2",
  managerFirstname: "Alice",
  managerLastname: "Doe",
  statutValidationInformationsJuridiquesMaisonMereAAP:
    StatutValidationInformationsJuridiquesMaisonMereAAP.A_METTRE_A_JOUR,
};

const maisonMereAAPExpertFiliere = {
  id: "00000000-0000-0000-0000-000000000020",
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
  id: "00000000-0000-0000-0000-000000000021",
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
  agencePrincipaleMaisonMere2,
  archiIperia1,
  archiIperia2,
  candidateAccount,
  collaborateurMaisonMereAapAccount2,
  gestionnaireMaisonMereAAP1,
  gestionnaireMaisonMereAAP2,
  lieuAccueilMaisonMere2,
  maisonMereAAP1,
  maisonMereAAP2,
  maisonMereAAPExpertBranche,
  maisonMereAAPExpertFiliere,
};
