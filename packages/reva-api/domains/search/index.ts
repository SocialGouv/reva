export interface Certification {
  id: string;
  title: string;
  description: string;
}

export interface Profession {
  id: string;
  title: string;
  description: string;
}

interface Params {
  query: string;
}

interface Dependencies {
  findCertificationsByQuery: (params: Params) => Promise<Certification[]>;
  findProfessionsByQuery: (params: Params) => Promise<Profession[]>;
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
          deps.findCertificationsByQuery({ query }),
          deps.findProfessionsByQuery({ query })
        ]
      );

      return {
        certifications,
        professions,
      };
    };
