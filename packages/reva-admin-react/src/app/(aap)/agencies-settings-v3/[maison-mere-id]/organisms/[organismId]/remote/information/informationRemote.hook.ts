import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { RemoteZone } from "@/graphql/generated/graphql";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getOrganismQuery = graphql(`
  query getOrganismForInformationRemotePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
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

const createOrUpdateRemoteOrganismGeneralInformationMutation = graphql(`
  mutation createOrUpdateRemoteOrganismGeneralInformationMutation(
    $organismId: ID!
    $maisonMereAAPId: ID!
    $informationsCommerciales: CreateOrUpdateRemoteOrganismGeneralInformationInput!
    $remoteZones: [RemoteZone!]!
  ) {
    organism_createOrUpdateRemoteOrganismGeneralInformation(
      organismId: $organismId
      maisonMereAAPId: $maisonMereAAPId
      informationsCommerciales: $informationsCommerciales
      remoteZones: $remoteZones
    ) {
      id
    }
  }
`);

export const useInformationRemotePage = ({
  organismId,
  maisonMereAAPId,
}: {
  organismId: string;
  maisonMereAAPId: string;
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
      remoteZones,
    }: {
      organismId: string;
      remoteZones: RemoteZone[];
      informationsCommerciales: {
        nom: string;
      };
    }) =>
      graphqlClient.request(
        createOrUpdateRemoteOrganismGeneralInformationMutation,
        {
          organismId,
          maisonMereAAPId,
          remoteZones,
          informationsCommerciales: informationsCommerciales,
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
