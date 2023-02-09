export interface Profession {
  id: number;
  label: string;
  codeRome: string;
}

export interface Activity {
  secteur: string;
  code_ogr: number;
  label: string;
}

export interface Competency {
  code_ogr: number;
  label: string;
  secteur: string;
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

export interface CertificationWithPurcentMatch extends Certification {
  purcent: number;
  nb_activities_match: number;
  nb_activities_total: number;
}
