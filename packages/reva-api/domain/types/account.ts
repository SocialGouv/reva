export type Group =
    "reva"
    | "organism"

export type Role =
    "admin-reva"
    | "manage-candidacy"

export interface IAMAccount {
    id: string;
    email: string;
}