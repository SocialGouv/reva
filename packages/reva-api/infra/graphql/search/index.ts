import { searchCertificationsAndProfessions } from "../../../domains/search";
import { searchCertificationsByQuery } from "../../database/postgres/certifications";
import { searchProfessionsByQuery } from "../../database/postgres/professions";


export const resolvers = {
  Query: {
    searchCertificationsAndProfessions: async (_: any, { query }: { query: string; }) => {
      const result = await searchCertificationsAndProfessions({
        searchCertificationsByQuery,
        searchProfessionsByQuery
      })({ query });

      return result;
    },
  },
};
