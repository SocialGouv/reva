import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrUpdateOrganismWithMaisonMereAapInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery } from "@tanstack/react-query";

const getAccountForConnectionUser = graphql(`
  query getMaisonMereAAP {
    account_getAccountForConnectedUser {
      organism {
        maisonMereAAP {
          id
          organisms {
            id
            label
            organismOnDepartments {
              id
              departmentId
              isRemote
              isOnSite
            }
            informationsCommerciales {
              conformeNormesAccessbilite
              adresseInformationsComplementaires
              nom
              telephone
              siteInternet
              emailContact
              adresseNumeroEtNomDeRue
              adresseInformationsComplementaires
              adresseCodePostal
              adresseVille
              conformeNormesAccessbilite
            }
            organismOnAccount {
              id
              firstname
              lastname
              email
            }
          }
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

const updateOrganismWithMaisonMereAAPMutation = graphql(`
  mutation updateOrganismWithMaisonMereAAPMutation(
    $organismId: ID!
    $organismData: CreateOrUpdateOrganismWithMaisonMereAAPInput!
  ) {
    organism_updateOrganismWithMaisonMereAAP(
      organismId: $organismId
      organismData: $organismData
    ) {
      id
    }
  }
`);

export const useAgencesQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: organismsResponse,
    status: organismsStatus,
    refetch: organismsRefetch,
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => graphqlClient.request(getAccountForConnectionUser),
  });

  const useCreateOrganismByMaisonMereAAP = useMutation({
    mutationFn: (organismData: CreateOrUpdateOrganismWithMaisonMereAapInput) =>
      graphqlClient.request(createOrganismWithMaisonMereAAPMutation, {
        organismData,
      }),
    mutationKey: ["organism"],
  });

  const useUpdateOrganismByMaisonMereAAP = useMutation({
    mutationFn: ({
      organismId,
      organismData,
    }: {
      organismId: string;
      organismData: CreateOrUpdateOrganismWithMaisonMereAapInput;
    }) =>
      graphqlClient.request(updateOrganismWithMaisonMereAAPMutation, {
        organismId,
        organismData,
      }),
    mutationKey: ["organism"],
  });

  const organisms =
    organismsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP?.organisms;
  const maisonMereAAPOnDepartements =
    organismsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP?.maisonMereAAPOnDepartements;

  const maisonMereAAP =
    organismsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;

  return {
    useCreateOrganismByMaisonMereAAP,
    useUpdateOrganismByMaisonMereAAP,
    organisms,
    organismsRefetch,
    maisonMereAAP,
    maisonMereAAPOnDepartements,
    organismsStatus,
  };
};
