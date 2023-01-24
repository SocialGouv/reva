export interface Profession {
  id: number;
  label: string;
}

export interface Competency {
  id: number;
  blocId: string;
  label: string;
}

export interface ProfessionAndCompetencies {
  profession: Profession | null;
  competencies: Competency[];
}

export interface Certification {
  id: number;
  rncpId: string;
  label: string;
}
