import { createCandidacy, getCandidacyFromDeviceId, getCompanions } from "../../../domains/candidacy";
import * as database from "../../database/postgres/candidacies";
import mercurius from "mercurius"


export const resolvers = {
  Query: {
    getCandidacy: async (_: unknown, { deviceId }: { deviceId: string; }) => {
      const result = await getCandidacyFromDeviceId({ getCandidacyFromDeviceId: database.getCandidacyFromDeviceId })({ deviceId });
      console.log("result: ", result.extract())
      return result.extract();
    },
    getCompanions: async () => {
      const result = await getCompanions({ getCompanions: database.getCompanions })();

      return result.extract();
    }
  },
  Mutation: {
    createCandidacy: async (_: unknown, { candidacy }: { candidacy: any; }) => {

      const result = await createCandidacy({
        createCandidacy: database.insertCandidacy,
        existsCompanion: database.getCompanionFromId,
        getCandidacyFromDeviceId: database.getCandidacyFromDeviceId,
      })({ candidacy });

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract()
    },
  }
};
