import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useQuery } from "@tanstack/react-query";

const CollaborareurSettingsInfoQuery = graphql(`
  query getCollaborateurSettingsInfo {
    account_getAccountForConnectedUser {
      maisonMereAAP {
        id
      }
      organism {
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
  const organism =
    collaborateurSettingsResponse?.account_getAccountForConnectedUser?.organism;

  const maisonMereAAPId = account?.maisonMereAAP?.id;

  return {
    collaborateurSettingsResponse,
    collaborateurSettingsStatus,
    account,
    organism,
    maisonMereAAPId,
  };
};
