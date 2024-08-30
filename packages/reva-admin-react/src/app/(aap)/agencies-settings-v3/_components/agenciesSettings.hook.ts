import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const AgenciesSettingsInfoQuery = graphql(`
  query getAgenciesSettingsInfo {
    account_getAccountForConnectedUser {
      organism {
        id
        isOnSite
        isRemote
        isVisibleInCandidateSearchResults
        accounts {
          id
          firstname
          lastname
          email
        }
        maisonMereAAP {
          statutValidationInformationsJuridiquesMaisonMereAAP
          organisms {
            id
            isRemote
            isVisibleInCandidateSearchResults
          }
        }
      }
    }
  }
`);

export const useAgenciesSettings = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: agenciesSettingsResponse, status: agenciesSettingsStatus } =
    useQuery({
      queryKey: ["agenciesSettingsInfo"],
      queryFn: () => graphqlClient.request(AgenciesSettingsInfoQuery),
    });

  const maisonMereAAP =
    agenciesSettingsResponse?.account_getAccountForConnectedUser?.organism
      ?.maisonMereAAP;

  const organism =
    agenciesSettingsResponse?.account_getAccountForConnectedUser?.organism;

  return {
    agenciesSettingsResponse,
    agenciesSettingsStatus,
    maisonMereAAP,
    organism,
  };
};
