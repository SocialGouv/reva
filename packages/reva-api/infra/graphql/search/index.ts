import { searchCertificationsAndProfessions } from "../../../domains/search";
import { findCertificationsByQuery } from "../../database/postgres/certifications";
import { findProfessionsByQuery } from "../../database/postgres/professions";


export const resolvers = {
  Query: {
    searchCertificationsAndProfessions: async (_: any, { query }: { query: string; }) => {
      const result = await searchCertificationsAndProfessions({
        findCertificationsByQuery,
        findProfessionsByQuery
      })({ query });

      return result;
    },
  },
};
