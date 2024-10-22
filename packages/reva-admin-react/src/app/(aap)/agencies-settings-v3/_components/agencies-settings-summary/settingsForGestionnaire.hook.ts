import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const HeadAgencySettingsInfoQuery = graphql(`
  query getHeadAgencySettingsInfo {
    account_getAccountForConnectedUser {
      id
      organism {
        id
        isOnSite
        isRemote
        isVisibleInCandidateSearchResults
        remoteZones
        informationsCommerciales {
          nom
        }
        maisonMereAAP {
          id
          isMCFCompatible
          statutValidationInformationsJuridiquesMaisonMereAAP
          organisms {
            isHeadAgency
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
              disabledAt
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

  const gestionnaireAccountId =
    headAgencySettingsResponse?.account_getAccountForConnectedUser?.id;

  return {
    headAgencySettingsResponse,
    headAgencySettingsStatus,
    maisonMereAAP,
    organism,
    gestionnaireAccountId,
  };
};
