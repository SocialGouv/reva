export type Group = "reva" | "organism";

export type Role = "admin" | "manage_candidacy";

export interface IAMAccount {
  id: string;
  email: string;
}

export interface Account {
  id: string;
  keycloakId: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  organismId: string | null;
  certificationAuthorityId: string | null;
}

export type AccountGroupFilter =
  | "admin"
  | "organism"
  | "certification_authority";
