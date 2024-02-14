import { GRAPHQL_API_URL } from "@/config/config";
import { GraphQLClient } from "graphql-request";

export const useGraphQlClient = () => {
  const graphqlClient = new GraphQLClient(GRAPHQL_API_URL);
  return { graphqlClient };
};
