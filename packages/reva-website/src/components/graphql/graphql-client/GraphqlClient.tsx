import { GraphQLClient } from "graphql-request";

import { GRAPHQL_API_URL } from "@/config/config";

export const useGraphQlClient = () => {
  const graphqlClient = new GraphQLClient(GRAPHQL_API_URL);
  return { graphqlClient };
};
