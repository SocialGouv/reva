import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { GraphQLClient } from "graphql-request";

export const useGraphQlStrapiClient = () => {
  const graphqlStrapiClient = new GraphQLClient(STRAPI_GRAPHQL_API_URL);
  return { graphqlStrapiClient };
};
