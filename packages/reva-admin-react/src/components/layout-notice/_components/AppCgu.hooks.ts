import { useMutation, useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const getMaisonMereCGUQuery = graphql(`
  query getMaisonMereCGUQuery {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
        cgu {
          version
          acceptedAt
          isLatestVersion
        }
      }
    }
  }
`);

const acceptMaisonMereCGUMutation = graphql(`
  mutation acceptMaisonMereCGUMutation {
    organism_acceptCgu
  }
`);

export const useAppCgu = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getMaisonMereCGU, isLoading: getMaisonMereCGUisLoading } =
    useQuery({
      queryKey: ["getMaisonMereCGUQuery"],
      queryFn: () => graphqlClient.request(getMaisonMereCGUQuery),
    });

  const acceptMaisonMereCgu = useMutation({
    mutationFn: () => graphqlClient.request(acceptMaisonMereCGUMutation),
  });

  const maisonMereCgu =
    getMaisonMereCGU?.account_getAccountForConnectedUser?.maisonMereAAP?.cgu;

  return {
    getMaisonMereCGUisLoading,
    maisonMereCgu,
    acceptMaisonMereCgu,
  };
};
