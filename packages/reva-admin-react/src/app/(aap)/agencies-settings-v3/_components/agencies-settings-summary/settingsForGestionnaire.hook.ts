import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GestionnaireMaisonMereAAPSettingsInfoQuery = graphql(`
  query getGestionnaireMaisonMereAAPSettingsInfo {
    account_getAccountForConnectedUser {
      id
      organisms {
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

  //TODO: gérer le cas où l'utilisateur a plusieurs organismes lorsque les interfaces seront prêtes
  //Pour l'instant le compte à au plus un organisme
  const organism =
    gestionnaireMaisonMerAAPSettingsResponse?.account_getAccountForConnectedUser
      ?.organisms?.[0];

  const maisonMereAAP = organism?.maisonMereAAP;

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
