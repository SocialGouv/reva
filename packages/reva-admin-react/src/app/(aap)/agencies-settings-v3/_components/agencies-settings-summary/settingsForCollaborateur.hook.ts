import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const AgencySettingsInfoQuery = graphql(`
  query getAgencySettingsInfo {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
      }
      organism {
        id
        label
        isHeadAgency
        isVisibleInCandidateSearchResults
        remoteZones
      }
      id
      firstname
      lastname
      email
    }
  }
`);

export const useAgencySettings = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: agencySettingsResponse, status: agencySettingsStatus } =
    useQuery({
      queryKey: ["agencySettingsInfo"],
      queryFn: () => graphqlClient.request(AgencySettingsInfoQuery),
    });

  const account = agencySettingsResponse?.account_getAccountForConnectedUser;
  const organism =
    agencySettingsResponse?.account_getAccountForConnectedUser?.organism;

  const maisonMereAAPId = account?.maisonMereAAP?.id;

  return {
    agencySettingsResponse,
    agencySettingsStatus,
    account,
    organism,
    maisonMereAAPId,
  };
};
