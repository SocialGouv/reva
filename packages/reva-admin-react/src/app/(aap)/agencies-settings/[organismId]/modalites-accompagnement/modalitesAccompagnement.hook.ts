import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { RemoteZone } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getOrganismQuery = graphql(`
  query getOrganismForModalitesAccompagnementPage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      isOnSite
      isRemote
      remoteZones
      isHeadAgency
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

const createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatusesMutation =
  graphql(`
    mutation createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatusesMutation(
      $createOrUpdateInformationsCommercialesInput: CreateOrUpdateInformationsCommercialesInput!
      $organismId: String!
      $isOnSite: Boolean!
      $isRemote: Boolean!
      $remoteZones: [RemoteZone!]!
    ) {
      organism_createOrUpdateInformationsCommerciales(
        informationsCommerciales: $createOrUpdateInformationsCommercialesInput
      ) {
        id
      }
      organism_updateOrganismOnSiteAndRemoteStatus(
        organismId: $organismId
        isOnSite: $isOnSite
        isRemote: $isRemote
        remoteZones: $remoteZones
      ) {
        id
      }
    }
  `);

export const useModalitesAccompagnementPage = () => {
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();

  const { organismId } = useParams<{ organismId: string }>();

  const {
    data: getOrganismResponse,
    status: getOrganismStatus,
    refetch: refetchOrganism,
  } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () =>
      graphqlClient.request(getOrganismQuery, {
        organismId,
      }),
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  const createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatuses =
    useMutation({
      mutationFn: ({
        organismId,
        informationsCommerciales,
        isOnSite,
        isRemote,
        remoteZones,
      }: {
        organismId: string;
        isOnSite: boolean;
        isRemote: boolean;
        remoteZones: RemoteZone[];
        informationsCommerciales: {
          nom: string;
        };
      }) =>
        graphqlClient.request(
          createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatusesMutation,
          {
            organismId,
            isOnSite,
            isRemote,
            remoteZones,
            createOrUpdateInformationsCommercialesInput: {
              organismId,
              ...informationsCommerciales,
            },
          },
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["organisms"] });
      },
    });

  return {
    organism,
    getOrganismStatus,
    refetchOrganism,
    createOrUpdateInformationsCommercialesAndOnSiteAndRemoteStatuses,
  };
};
