import * as goalsDb from "../../database/postgres/goals";

export const resolvers = {
  Query: {
    // eslint-disable-next-line
    // @ts-ignore
    getReferential: async (_: any, _payload: any) => {
      
      const goals = (await goalsDb.getGoals()).orDefault([])

      return {
        goals: goals
      }
    }
  },
};
