export interface Certification {
  id: string;
  label: string;
  description: string | null;
  codeRncp: string;
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

interface Dependencies {
  searchCertificationsByQuery: (params: Params) => Promise<Certification[]>;
  searchProfessionsByQuery: (params: Params) => Promise<Profession[]>;
}

interface SearchResult {
  certifications: Certification[];
  professions: Profession[];
}

export const searchCertificationsAndProfessions =
  (deps: Dependencies) =>
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
