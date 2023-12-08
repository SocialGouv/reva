import { GraphQLClient } from "graphql-request";
import { GRAPHQL_API_URL } from "@/config/config";
import { useKeycloakContext } from "@/components/auth/keycloakContext";

export const useGraphQlClient = () => {
  const { accessToken } = useKeycloakContext();
  const graphqlClient = new GraphQLClient(GRAPHQL_API_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  return { graphqlClient };
};
