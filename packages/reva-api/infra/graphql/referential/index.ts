import { getCertifications } from "../../../domain/features/getCertifications";
import * as goalsDb from "../../database/postgres/goals";
import * as certificationsDb from "../../database/postgres/certifications";
import mercurius from "mercurius";

export const resolvers = {
  Query: {
    // eslint-disable-next-line
    // @ts-ignore
    getReferential: async (_: any, _payload: any) => {
      
      const goals = (await goalsDb.getGoals()).orDefault([]);

      return {
        goals: goals
      };
    },
    getCertifications: async (_: any, _payload: any) => {
      const result = await getCertifications({
        getCertifications:  certificationsDb.getCertifications
      })();

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    }
  },
};
