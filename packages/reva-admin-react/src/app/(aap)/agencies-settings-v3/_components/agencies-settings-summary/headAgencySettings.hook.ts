import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const HeadAgencySettingsInfoQuery = graphql(`
  query getHeadAgencySettingsInfo {
    account_getAccountForConnectedUser {
      organism {
        id
        isOnSite
        isRemote
        isVisibleInCandidateSearchResults
        remoteZones
        accounts {
          id
          firstname
          lastname
          email
        }
        maisonMereAAP {
          statutValidationInformationsJuridiquesMaisonMereAAP
          organisms {
            informationsCommerciales {
              nom
            }
            label
            id
            isRemote
            isOnSite
            isVisibleInCandidateSearchResults
            remoteZones
            accounts {
              id
              email
              firstname
              lastname
            }
          }
        }
      }
    }
  }
`);

export const useHeadyAgencySettings = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: headAgencySettingsResponse, status: headAgencySettingsStatus } =
    useQuery({
      queryKey: ["headAgencySettingsInfo"],
      queryFn: () => graphqlClient.request(HeadAgencySettingsInfoQuery),
    });

  const maisonMereAAP =
    headAgencySettingsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;

  const organism =
    headAgencySettingsResponse?.account_getAccountForConnectedUser?.organism;

  return {
    headAgencySettingsResponse,
    headAgencySettingsStatus,
    maisonMereAAP,
    organism,
  };
};
