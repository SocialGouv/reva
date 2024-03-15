export type CandidacyMenuEntryStatus =
  | "INACTIVE"
  | "ACTIVE_WITHOUT_HINT"
  | "ACTIVE_WITH_EDIT_HINT";

export interface CandidacyMenuEntry {
  label: string;
  url: string;
  status: CandidacyMenuEntryStatus;
}

export interface CandidacyMenu {
  menuHeader: CandidacyMenuEntry[];
  mainMenu: CandidacyMenuEntry[];
  menuFooter: CandidacyMenuEntry[];
}
