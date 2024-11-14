import { Account } from "@prisma/client";

const ACCOUNT_BASE: Account = {
  id: "00000000-0000-0000-0000-000000000000",
  firstname: "",
  lastname: "",
  email: "",
  organismId: null,
  certificationAuthorityId: null,
  keycloakId: "00000000-0000-0000-0000-000000000000",
  disabledAt: null,
};

export const ACCOUNT_MAISON_MERE_EXPERT_FILIERE: Account = {
  ...ACCOUNT_BASE,
  id: "00000000-0000-0000-0000-000000000012",
  keycloakId: "00000000-0000-0000-0000-000000000013",
  firstname: "Peter",
  lastname: "Griffin",
  email: "peter@yolo.fr",
};

export const ACCOUNT_2: Account = {
  ...ACCOUNT_BASE,
  id: "00000000-0000-0000-0000-000000000014",
  keycloakId: "00000000-0000-0000-0000-000000000015",
  firstname: "Marge",
  lastname: "Simpson",
  email: "marge@yolo.fr",
};

export const ACCOUNT_3: Account = {
  ...ACCOUNT_BASE,
  id: "00000000-0000-0000-0000-000000000016",
  keycloakId: "00000000-0000-0000-0000-000000000017",
  firstname: "Bart",
  lastname: "Simpson",
  email: "bart@yolo.fr",
};

export const ACCOUNT_ORGANISM_EXPERT_FILIERE: Account = {
  ...ACCOUNT_BASE,
  id: "00000000-0000-0000-0000-000000000018",
  keycloakId: "00000000-0000-0000-0000-000000000019",
};
