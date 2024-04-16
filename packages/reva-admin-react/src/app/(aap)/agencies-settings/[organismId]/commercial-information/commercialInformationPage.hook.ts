import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const informationsCommercialesQuery = graphql(`
  query getOrganismInformationsCommercialesForCommercialInformationPage(
    $organismId: ID!
  ) {
    organism_getOrganism(id: $organismId) {
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

export const useCommercialInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { organismId } = useParams<{ organismId: string }>();

  const {
    data: informationsCommercialesResponse,
    status: informationsCommercialesStatus,
    refetch: refetchInformationsCommerciales,
  } = useQuery({
    queryKey: ["informationsCommerciales"],
    queryFn: () =>
      graphqlClient.request(informationsCommercialesQuery, { organismId }),
  });

  const informationsCommerciales =
    informationsCommercialesResponse?.organism_getOrganism
      ?.informationsCommerciales;

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
