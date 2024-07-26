import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getOrganismQuery = graphql(`
  query getOrganismForInformationsGeneralesOnSitePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      isOnSite
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

const createOrUpdateInformationsCommercialesOnSiteStatusMutation = graphql(`
  mutation createOrUpdateInformationsCommercialesOnSiteStatusMutation(
    $createOrUpdateInformationsCommercialesInput: CreateOrUpdateInformationsCommercialesInput!
    $organismId: String!
  ) {
    organism_createOrUpdateInformationsCommerciales(
      informationsCommerciales: $createOrUpdateInformationsCommercialesInput
    ) {
      id
    }
    organism_updateOrganismOnSiteAndRemoteStatus(
      organismId: $organismId
      isOnSite: true
      isRemote: false
      remoteZones: []
    ) {
      id
    }
  }
`);

export const useInformationsGeneralesOnSitePage = () => {
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();

  const { organismId } = useParams<{ organismId: string }>();

  const { data: getOrganismResponse, status: getOrganismStatus } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () =>
      graphqlClient.request(getOrganismQuery, {
        organismId,
      }),
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  const createOrUpdateInformationsCommercialesOnSiteStatus = useMutation({
    mutationFn: ({
      organismId,
      informationsCommerciales,
    }: {
      organismId: string;
      informationsCommerciales: {
        nom: string;
      };
    }) =>
      graphqlClient.request(
        createOrUpdateInformationsCommercialesOnSiteStatusMutation,
        {
          organismId,
          createOrUpdateInformationsCommercialesInput: {
            organismId,
            ...informationsCommerciales,
          },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [organismId, "organisms"] });
    },
  });

  return {
    organism,
    getOrganismStatus,
    createOrUpdateInformationsCommercialesOnSiteStatus,
  };
};
