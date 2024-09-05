import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const AgencySettingsInfoQuery = graphql(`
  query getAgencySettingsInfo {
    account_getAccountForConnectedUser {
      organism {
        id
        label
        isOnSite
        isRemote
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

  return {
    agencySettingsResponse,
    agencySettingsStatus,
    account,
    organism,
  };
};
