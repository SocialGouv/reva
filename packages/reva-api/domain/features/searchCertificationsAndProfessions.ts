import { Certification, Profession } from "../types/search";

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