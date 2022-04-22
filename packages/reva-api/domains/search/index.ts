export const CertificationStatus = {
  INACTIVE: 'INACTIVE',
  SOON: 'SOON',
  AVAILABLE: 'AVAILABLE'
};

export type CertificationStatus = (typeof CertificationStatus)[keyof typeof CertificationStatus]


export interface Certification {
  id: string;
  label: string;
  summary: string | null;
  acronym: string | null;
  level: number;
  activities: string | null;
  activityArea: string | null;
  accessibleJobType: string | null;
  abilities: string | null;
  codeRncp: string;
  status: CertificationStatus;
}

export interface Profession {
  id: string;
  label: string;
  description: string | null;
  codeRome: string;
}

interface Params {
  query: string;
}

interface SearchDependencies {
  searchCertificationsByQuery: (params: Params) => Promise<Certification[]>;
  searchProfessionsByQuery: (params: Params) => Promise<Profession[]>;
}

interface SearchResult {
  certifications: Certification[];
  professions: Profession[];
}

export const searchCertificationsAndProfessions =
  (deps: SearchDependencies) =>
    async ({ query }: Params): Promise<SearchResult> => {
      const [certifications, professions] = await Promise.all(
        [
          deps.searchCertificationsByQuery({ query }),
          deps.searchProfessionsByQuery({ query })
        ]
      );

      return {
        certifications,
        professions,
      };
    };


interface GetCertificationDependencies {
  getCertificationById: (params: { id: string; }) => Promise<Certification | null>;
}

export const getCertification =
  (deps: GetCertificationDependencies) =>
    async ({ id }: { id: string; }): Promise<Certification | null> => {
      return deps.getCertificationById({ id });
    }

