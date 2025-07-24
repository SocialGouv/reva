import { GraphQLClient } from "graphql-request";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { GRAPHQL_API_URL } from "@/config/config";

export const useGraphQlClient = () => {
  const { accessToken } = useKeycloakContext();
  const graphqlClient = new GraphQLClient(GRAPHQL_API_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  return { graphqlClient };
};
