import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateOrUpdateInformationsCommercialesInput } from "@/graphql/generated/graphql";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getOrganismQuery = graphql(`
  query getOrganismForInformationOnSitePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      label
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
      maisonMereAAP {
        raisonSociale
      }
    }
  }
`);

const createOrUpdateInformationsCommercialesMutation = graphql(`
  mutation createOrUpdateInformationsCommercialesMutation(
    $createOrUpdateInformationsCommercialesInput: CreateOrUpdateInformationsCommercialesInput!
  ) {
    organism_createOrUpdateInformationsCommerciales(
      informationsCommerciales: $createOrUpdateInformationsCommercialesInput
    ) {
      id
    }
  }
`);

export const useOrganismInformationOnSite = () => {
  const { isAdmin } = useAuth();
  const { graphqlClient } = useGraphQlClient();
  const { organismId, "maison-mere-id": maisonMereAAPId } = useParams<{
    organismId: string;
    "maison-mere-id": string;
  }>();
  const { data, isLoading } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () =>
      graphqlClient.request(getOrganismQuery, {
        organismId,
      }),
  });

  const { mutateAsync: createOrUpdateInformationsCommerciales } = useMutation({
    mutationFn: (
      informationsCommerciales: CreateOrUpdateInformationsCommercialesInput,
    ) =>
      graphqlClient.request(createOrUpdateInformationsCommercialesMutation, {
        createOrUpdateInformationsCommercialesInput: informationsCommerciales,
      }),
  });

  const organism = data?.organism_getOrganism;
  const informationsCommerciales = organism?.informationsCommerciales;

  return {
    organism,
    isLoading,
    organismId,
    maisonMereAAPId,
    informationsCommerciales,
    createOrUpdateInformationsCommerciales,
    isAdmin,
  };
};
