import { GraphQLClient } from "graphql-request";
import { GRAPHQL_API_URL } from "@/config/config";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export const useGraphQlClient = () => {
  const { data: session } = useSession();

  const graphqlClient = new GraphQLClient(GRAPHQL_API_URL, {
    headers: {
      authorization: `Bearer ${
        (session as Session & { accessToken: string }).accessToken
      }`,
    },
  });
  return { graphqlClient };
};
