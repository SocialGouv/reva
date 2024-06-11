import { useQuery, useMutation } from "@tanstack/react-query";

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

  const getMaisonMereCGU = useQuery({
    queryKey: ["getMaisonMereCGUQuery"],
    queryFn: () => graphqlClient.request(getMaisonMereCGUQuery),
  });

  const acceptMaisonMereCgu = useMutation({
    mutationFn: () => graphqlClient.request(acceptMaisonMereCGUMutation),
  });

  return {
    getMaisonMereCGU,
    acceptMaisonMereCgu,
  };
};
