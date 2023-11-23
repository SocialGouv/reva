import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";

const informationsCommercialesQuery = graphql(`
  query getAccountOrganismAndInformationsCommerciales {
    account_getAccountForConnectedUser {
      organism {
        id
        informationsCommerciales {
          id
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
      }
    }
  }
`);

const createOrUpdateInformationsCommercialesMutation = graphql(`
  mutation createOrUpdateInformationsCommercialesMutation(
    $informationsCommerciales: CreateOrUpdateInformationsCommercialesInput!
  ) {
    organism_createOrUpdateInformationsCommerciales(
      informationsCommerciales: $informationsCommerciales
    ) {
      id
    }
  }
`);

export const useCommercialInformationPageQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: informationsCommercialesResponse,
    status: informationsCommercialesStatus,
    refetch: refetchInformationsCommerciales,
  } = useQuery({
    queryKey: ["informationsCommerciales"],
    queryFn: () => graphqlClient.request(informationsCommercialesQuery),
  });

  const informationsCommerciales =
    informationsCommercialesResponse?.account_getAccountForConnectedUser
      ?.organism?.informationsCommerciales;

  const organismId =
    informationsCommercialesResponse?.account_getAccountForConnectedUser
      ?.organism?.id || "";

  const createOrUpdateInformationsCommerciales = useMutation({
    mutationFn: (informationsCommerciales: {
      organismId: string;
      nom: string;
    }) =>
      graphqlClient.request(createOrUpdateInformationsCommercialesMutation, {
        informationsCommerciales,
      }),
  });

  return {
    informationsCommerciales,
    organismId,
    informationsCommercialesStatus,
    refetchInformationsCommerciales,
    createOrUpdateInformationsCommerciales,
  };
};
