export interface Certification {
  id: string;
  description: string;
  codeRncp: string;
  summary: string;
  label: string;
  activities?: string;
  abilities?: string;
  activityArea?: string;
  accessibleJobType?: string;
  status: "AVAILABLE" | "SOON";
}

export interface Contact {
  phone: string;
  email: string;
}

export type duration =
  | "unknown"
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears"
  | "moreThanFiveYears"
  | "moreThanTenYears";

export interface Experience {
  title: string;
  startDate: Date;
  description: string;
  duration: duration;
}

export interface Experiences {
  edited?: Experience;
  rest: Experience[];
}

export interface Goal {
  checked: boolean;
  id: string;
  label: string;
}

export interface Candidacy {
  certification: Certification;
  experiences: Experience[];
  goals: Goal[];
  startDate: Date;
}
