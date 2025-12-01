import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CollaborareurSettingsInfoQuery = graphql(`
  query getCollaborateurSettingsInfo {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
      }
      organisms {
        id
        label
        modaliteAccompagnement
        modaliteAccompagnementRenseigneeEtValide
        isVisibleInCandidateSearchResults
        remoteZones
        nomPublic
      }
      id
      firstname
      lastname
      email
    }
  }
`);

export const useCollaborateurSettings = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: collaborateurSettingsResponse,
    status: collaborateurSettingsStatus,
  } = useQuery({
    queryKey: ["collaborateurSettingsInfo"],
    queryFn: () => graphqlClient.request(CollaborareurSettingsInfoQuery),
  });

  const account =
    collaborateurSettingsResponse?.account_getAccountForConnectedUser;

  //TODO: gérer le cas où l'utilisateur a plusieurs organismes lorsque les interfaces seront prêtes
  //Pour l'instant le compte à au plus un organisme
  const organism =
    collaborateurSettingsResponse?.account_getAccountForConnectedUser
      ?.organisms?.[0];

  const maisonMereAAPId = account?.maisonMereAAP?.id;

  return {
    collaborateurSettingsResponse,
    collaborateurSettingsStatus,
    account,
    organism,
    maisonMereAAPId,
  };
};
