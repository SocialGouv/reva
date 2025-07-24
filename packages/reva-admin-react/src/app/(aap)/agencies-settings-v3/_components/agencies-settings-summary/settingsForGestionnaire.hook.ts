import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const GestionnaireMaisonMereAAPSettingsInfoQuery = graphql(`
  query getGestionnaireMaisonMereAAPSettingsInfo {
    account_getAccountForConnectedUser {
      id
      organism {
        id
        isVisibleInCandidateSearchResults
        remoteZones
        nomPublic
        maisonMereAAP {
          id
          isMCFCompatible
          statutValidationInformationsJuridiquesMaisonMereAAP
          organisms {
            modaliteAccompagnement
            nomPublic
            label
            id
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

export const useGestionnaireMaisonMereAAPSettings = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: gestionnaireMaisonMerAAPSettingsResponse,
    status: gestionnaireMaisonMerAAPSettingsStatus,
  } = useQuery({
    queryKey: ["gestionnaireMaisonMerAAPSettingsInfo"],
    queryFn: () =>
      graphqlClient.request(GestionnaireMaisonMereAAPSettingsInfoQuery),
  });

  const maisonMereAAP =
    gestionnaireMaisonMerAAPSettingsResponse?.account_getAccountForConnectedUser
      ?.organism?.maisonMereAAP;

  const organism =
    gestionnaireMaisonMerAAPSettingsResponse?.account_getAccountForConnectedUser
      ?.organism;

  const gestionnaireAccountId =
    gestionnaireMaisonMerAAPSettingsResponse?.account_getAccountForConnectedUser
      ?.id;

  return {
    gestionnaireMaisonMerAAPSettingsResponse,
    gestionnaireMaisonMerAAPSettingsStatus,
    maisonMereAAP,
    organism,
    gestionnaireAccountId,
  };
};
