import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CreateOrUpdateOnSiteOrganismGeneralInformationInput } from "@/graphql/generated/graphql";

const getOrganismQuery = graphql(`
  query getOrganismForInformationOnSitePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      label
      id
      nomPublic
      telephone
      siteInternet
      emailContact
      adresseNumeroEtNomDeRue
      adresseInformationsComplementaires
      adresseCodePostal
      adresseVille
      conformeNormesAccessibilite
      maisonMereAAP {
        raisonSociale
      }
    }
  }
`);

const createOrUpdateOnSiteOrganismGeneralInformationMutation = graphql(`
  mutation createOrUpdateOnSiteOrganismGeneralInformationMutation(
    $organismId: ID!
    $maisonMereAAPId: ID!
    $informationsCommerciales: CreateOrUpdateOnSiteOrganismGeneralInformationInput!
  ) {
    organism_createOrUpdateOnSiteOrganismGeneralInformation(
      organismId: $organismId
      maisonMereAAPId: $maisonMereAAPId
      informationsCommerciales: $informationsCommerciales
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
      informationsCommerciales: CreateOrUpdateOnSiteOrganismGeneralInformationInput,
    ) =>
      graphqlClient.request(
        createOrUpdateOnSiteOrganismGeneralInformationMutation,
        {
          organismId,
          maisonMereAAPId,
          informationsCommerciales,
        },
      ),
  });

  const organism = data?.organism_getOrganism;

  return {
    organism,
    isLoading,
    organismId,
    maisonMereAAPId,
    createOrUpdateInformationsCommerciales,
    isAdmin,
  };
};
