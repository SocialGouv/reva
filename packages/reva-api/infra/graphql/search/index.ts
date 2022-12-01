import { getCertification } from "../../../domain/features/getCertification";
import { searchCertificationsAndProfessions } from "../../../domain/features/searchCertificationsAndProfessions";
import {
  getCertificationById,
  searchCertificationsByQuery,
} from "../../database/postgres/certifications";
import { searchProfessionsByQuery } from "../../database/postgres/professions";

export const resolvers = {
  Query: {
    searchCertificationsAndProfessions: async (
      _: any,
      { query }: { query: string }
    ) => {
      const result = await searchCertificationsAndProfessions({
        searchCertificationsByQuery,
        searchProfessionsByQuery,
      })({ query });

      return result;
    },
    getCertification: async (_: any, { id }: { id: string }) => {
      const result = await getCertification({ getCertificationById })({ id });

      return result;
    },
  },
};
