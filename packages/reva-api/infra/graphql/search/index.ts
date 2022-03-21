import { searchCertificationsAndProfessions, getCertification } from "../../../domains/search";
import { searchCertificationsByQuery, getCertificationById } from "../../database/postgres/certifications";
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
    getCertification: async (_: any, {id}: {id: string}) => {
      const result = await getCertification({getCertificationById})({id});

      return result
    }
  },
};
