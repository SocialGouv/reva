import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getOrganismQuery = graphql(`
  query getOrganismForModalitesAccompagnementPage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      isOnSite
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
      organismOnDepartments {
        id
        departmentId
        isRemote
        isOnSite
      }
    }
    getDepartments {
      id
      code
      label
      region {
        id
        code
        label
      }
    }
  }
`);

const createOrUpdateInformationsCommercialesAndInterventionZoneMutation =
  graphql(`
    mutation createOrUpdateInformationsCommercialesAndInterventionZoneMutation(
      $createOrUpdateInformationsCommercialesInput: CreateOrUpdateInformationsCommercialesInput!
      $updateInterventionZoneInput: UpdateOrganismInterventionZoneInput!
      $organismId: String!
      $isOnSite: Boolean!
    ) {
      organism_createOrUpdateInformationsCommerciales(
        informationsCommerciales: $createOrUpdateInformationsCommercialesInput
      ) {
        id
      }
      organism_updateOrganismInterventionZone(
        data: $updateInterventionZoneInput
      ) {
        id
      }
      organism_updateOrganismOnSiteStatus(
        organismId: $organismId
        isOnSite: $isOnSite
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
  const departments = getOrganismResponse?.getDepartments || [];

  const createOrUpdateInformationsCommercialesAndInterventionZone = useMutation(
    {
      mutationFn: ({
        organismId,
        informationsCommerciales,
        interventionZone,
        isOnSite,
      }: {
        organismId: string;
        isOnSite: boolean;
        informationsCommerciales: {
          nom: string;
        };
        interventionZone: {
          departmentId: string;
          isOnSite: boolean;
          isRemote: boolean;
        }[];
      }) =>
        graphqlClient.request(
          createOrUpdateInformationsCommercialesAndInterventionZoneMutation,
          {
            organismId,
            isOnSite,
            createOrUpdateInformationsCommercialesInput: {
              organismId,
              ...informationsCommerciales,
            },
            updateInterventionZoneInput: { organismId, interventionZone },
          },
        ),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["organisms"] });
        },
    },
  );

  return {
    organism,
    departments,
    getOrganismStatus,
    refetchOrganism,
    createOrUpdateInformationsCommercialesAndInterventionZone,
  };
};
