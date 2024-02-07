import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const interventionZoneQueries = graphql(`
  query getAccountOrganismAndInterventionZone {
    account_getAccountForConnectedUser {
      organism {
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
  }
`);

export const useInterventionZonePageQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: interventionZoneResponse,
    status: interventionZoneStatus,
    isError: interventionZoneIsError,
    isSuccess: interventionZoneIsSuccess,
  } = useQuery({
    queryKey: ["interventionZone"],
    queryFn: () => graphqlClient.request(interventionZoneQueries),
  });

  const maisonMereAAP =
    interventionZoneResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;

  const organism =
    interventionZoneResponse?.account_getAccountForConnectedUser?.organism;
  return {
    interventionZoneIsError,
    interventionZoneResponse,
    interventionZoneStatus,
    interventionZoneIsSuccess,
    maisonMereAAP,
    organism,
  };
};
