import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrUpdateOrganismWithMaisonMereAapInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getAccountForConnectedUserQuery = graphql(`
  query getMaisonMereAAPForAgencePage {
    account_getAccountForConnectedUser {
      organism {
        id
        maisonMereAAP {
          id
          maisonMereAAPOnDepartements {
            departement {
              id
              label
              code
              region {
                id
                label
              }
            }
            estSurPlace
            estADistance
          }
        }
      }
    }
  }
`);

const createOrganismWithMaisonMereAAPMutation = graphql(`
  mutation createOrganismWithMaisonMereAAPMutation(
    $organismData: CreateOrUpdateOrganismWithMaisonMereAAPInput!
  ) {
    organism_createOrganismWithMaisonMereAAP(organismData: $organismData)
  }
`);

export const useAgencePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getAccountForConnectedUserResponse } = useQuery({
    queryKey: ["account"],
    queryFn: () => graphqlClient.request(getAccountForConnectedUserQuery),
  });

  const createOrganismByMaisonMereAAP = useMutation({
    mutationFn: (organismData: CreateOrUpdateOrganismWithMaisonMereAapInput) =>
      graphqlClient.request(createOrganismWithMaisonMereAAPMutation, {
        organismData,
      }),
    mutationKey: ["organisms"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  const maisonMereAAPOnDepartements =
    getAccountForConnectedUserResponse?.account_getAccountForConnectedUser
      ?.organism?.maisonMereAAP?.maisonMereAAPOnDepartements || [];

  return {
    createOrganismByMaisonMereAAP,
    maisonMereAAPOnDepartements,
  };
};
