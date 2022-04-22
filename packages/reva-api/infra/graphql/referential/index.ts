export const resolvers = {
  Query: {
    // eslint-disable-next-line
    // @ts-ignore
    getReferential: async (_: any, _payload: any) => {
      

      return {
        goals: []
      }
    }
  },
};
