import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrganismInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery } from "@tanstack/react-query";

const agencesQuery = graphql(`
  query getMaisonMereAAP {
    account_getAccountForConnectedUser {
      agences {
        id
        label
        informationsCommerciales {
          nom
        }
      }
      organism {
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

const createAgenceByMaisonMereAAPMutation = graphql(`
  mutation createAgenceByMaisonMereAAPMutation(
    $organismData: CreateOrganismInput!
  ) {
    organism_createOrganismWithMaisonMereAAP(organismData: $organismData)
  }
`);

export const useAgencesQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: agencesResponse,
    status: agencesStatus,
    refetch: agencesRefetch,
  } = useQuery({
    queryKey: ["agences"],
    queryFn: () => graphqlClient.request(agencesQuery),
  });

  const useCreateAgenceByMaisonMereAAP = useMutation({
    mutationFn: (organismData: CreateOrganismInput) =>
      graphqlClient.request(createAgenceByMaisonMereAAPMutation, {
        organismData,
      }),
  });

  const agences = agencesResponse?.account_getAccountForConnectedUser?.agences;
  const maisonMereAAPOnDepartements =
    agencesResponse?.account_getAccountForConnectedUser?.organism?.maisonMereAAP
      ?.maisonMereAAPOnDepartements;

  return {
    useCreateAgenceByMaisonMereAAP,
    agences,
    agencesRefetch,
    maisonMereAAPOnDepartements,
    agencesStatus,
  };
};
