export type Page = "show-results" | "load-submission";
export type Direction = "previous" | "next";
export type Navigation = { direction: Direction; page: Page };

export interface Certificate {
  id: string;
  description: string;
  label: string;
  title: string;
}
