import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrUpdateOrganismWithMaisonMereAapInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getAccountForConnectionUser = graphql(`
  query getMaisonMereAAP {
    account_getAccountForConnectedUser {
      organism {
        id
        maisonMereAAP {
          id
          organisms {
            id
            label
            fermePourAbsenceOuConges
            isActive
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

export const useAgencePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: organismsResponse,
    status: organismsStatus,
    refetch: organismsRefetch,
    isRefetching: organismsIsRefetching,
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => graphqlClient.request(getAccountForConnectionUser),
  });

  const createOrganismByMaisonMereAAP = useMutation({
    mutationFn: (organismData: CreateOrUpdateOrganismWithMaisonMereAapInput) =>
      graphqlClient.request(createOrganismWithMaisonMereAAPMutation, {
        organismData,
      }),
    mutationKey: ["organisms"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
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

  const organismMaisonMereAAPId =
    organismsResponse?.account_getAccountForConnectedUser?.organism?.id;

  return {
    createOrganismByMaisonMereAAP,
    organisms,
    organismsRefetch,
    organismsIsRefetching,
    maisonMereAAP,
    maisonMereAAPOnDepartements,
    organismsStatus,
    organismMaisonMereAAPId,
  };
};
