import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const interventionZoneQuery = graphql(`
  query getOrganismInterventionZoneForInterventionZonePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      organismOnDepartments {
        id
        departmentId
        isRemote
        isOnSite
      }
      maisonMereAAP {
        typologie
        maisonMereAAPOnDepartements {
          estSurPlace
          estADistance
          departement {
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
      }
    }
  }
`);

const updateInterventionZoneMutation = graphql(`
  mutation updateOrganismInterventionZoneMutationForInterventionZonePage(
    $data: UpdateOrganismInterventionZoneInput!
  ) {
    organism_updateOrganismInterventionZone(data: $data) {
      id
    }
  }
`);
export const useInterventionZonePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();

  const { data: interventionZoneResponse, isError: interventionZoneIsError } =
    useQuery({
      queryKey: ["interventionZone"],
      queryFn: () =>
        graphqlClient.request(interventionZoneQuery, { organismId }),
    });

  const updateOrganismInterventionZone = useMutation({
    mutationFn: (data: {
      organismId: string;
      interventionZone: {
        departmentId: string;
        isOnSite: boolean;
        isRemote: boolean;
      }[];
    }) =>
      graphqlClient.request(updateInterventionZoneMutation, {
        data,
      }),
  });

  const maisonMereAAP =
    interventionZoneResponse?.organism_getOrganism?.maisonMereAAP;

  const organism = interventionZoneResponse?.organism_getOrganism;
  return {
    interventionZoneIsError,
    maisonMereAAP,
    organism,
    updateOrganismInterventionZone,
  };
};
