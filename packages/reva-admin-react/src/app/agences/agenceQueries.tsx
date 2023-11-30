import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const agencesQuery = graphql(`
  query getAgences {
    account_getAccountForConnectedUser {
      agences {
        id
        label
      }
    }
  }
`);

export const useAgencesQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: agencesResponse, status: agencesStatus } = useQuery({
    queryKey: ["agences"],
    queryFn: () => graphqlClient.request(agencesQuery),
  });

  const agences = agencesResponse?.account_getAccountForConnectedUser?.agences;

  return {
    agences,
    agencesStatus,
  };
};
