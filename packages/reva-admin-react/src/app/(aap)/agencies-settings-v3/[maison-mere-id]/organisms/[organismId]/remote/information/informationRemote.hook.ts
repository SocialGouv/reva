import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { RemoteZone } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getOrganismQuery = graphql(`
  query getOrganismForInformationRemotePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      isRemote
      remoteZones
      informationsCommerciales {
        id
        nom
        telephone
        siteInternet
        emailContact
      }
      maisonMereAAP {
        raisonSociale
      }
    }
  }
`);

const createOrUpdateInformationsCommercialesAndRemoteStatusMutation = graphql(`
  mutation createOrUpdateInformationsCommercialesAndRemoteStatusMutation(
    $createOrUpdateInformationsCommercialesInput: CreateOrUpdateInformationsCommercialesInput!
    $organismId: String!
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
      isOnSite: false
      isRemote: $isRemote
      remoteZones: $remoteZones
    ) {
      id
    }
  }
`);

export const useInformationRemotePage = ({
  organismId,
}: {
  organismId: string;
}) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse, status: getOrganismStatus } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () =>
      graphqlClient.request(getOrganismQuery, {
        organismId,
      }),
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  const createOrUpdateInformationsCommercialesAndRemoteStatus = useMutation({
    mutationFn: ({
      organismId,
      informationsCommerciales,
      isRemote,
      remoteZones,
    }: {
      organismId: string;
      isRemote: boolean;
      remoteZones: RemoteZone[];
      informationsCommerciales: {
        nom: string;
      };
    }) =>
      graphqlClient.request(
        createOrUpdateInformationsCommercialesAndRemoteStatusMutation,
        {
          organismId,
          isRemote,
          remoteZones,
          createOrUpdateInformationsCommercialesInput: {
            organismId,
            ...informationsCommerciales,
          },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [organismId, "organism"] });
    },
  });

  return {
    organism,
    getOrganismStatus,
    createOrUpdateInformationsCommercialesAndRemoteStatus,
    isAdmin,
  };
};
