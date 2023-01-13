export interface Job {
  code: string;
  label: string;
}

export interface Competency {
  code: string;
  label: string;
}

export interface JobAndCompetencies {
  job: Job | null;
  competencies: Competency[];
}

export interface Certification {
  code: string;
  label: string;
}
