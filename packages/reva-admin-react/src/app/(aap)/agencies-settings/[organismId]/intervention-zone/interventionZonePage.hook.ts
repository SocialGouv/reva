import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
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
      }
    }
  }
`);

export const useInterventionZonePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();

  const {
    data: interventionZoneResponse,
    status: interventionZoneStatus,
    isError: interventionZoneIsError,
    isSuccess: interventionZoneIsSuccess,
  } = useQuery({
    queryKey: ["interventionZone"],
    queryFn: () => graphqlClient.request(interventionZoneQuery, { organismId }),
  });

  const maisonMereAAP =
    interventionZoneResponse?.organism_getOrganism?.maisonMereAAP;

  const organism = interventionZoneResponse?.organism_getOrganism;
  return {
    interventionZoneIsError,
    interventionZoneResponse,
    interventionZoneStatus,
    interventionZoneIsSuccess,
    maisonMereAAP,
    organism,
  };
};
