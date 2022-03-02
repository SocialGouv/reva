interface Certification {
  id: string;
}

interface Profession {
  id: string;
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
    const certifications = await deps.findCertificationsByQuery({ query });
    const professions = await deps.findProfessionsByQuery({ query });

    return {
      certifications,
      professions,
    };
  };
