import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const collaborateurSettingsInfoQuery = graphql(`
  query getCollaborateurSettingsInfoForCollaborateurSettingsPage(
    $accountId: ID!
  ) {
    organism_getCompteCollaborateurById(accountId: $accountId) {
      id
      maisonMereAAP {
        id
      }
      organisms {
        id
        modaliteAccompagnement
        modaliteAccompagnementRenseigneeEtValide
        isVisibleInCandidateSearchResults
        remoteZones
        nomPublic
      }
    }
  }
`);

export const useCollaborateurSettingsPage = ({
  collaborateurUserAccountId,
}: {
  collaborateurUserAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: collaborateurSettingsResponse } = useQuery({
    queryKey: [collaborateurUserAccountId, "collaborateurSettingsInfoV2"],
    queryFn: () =>
      graphqlClient.request(collaborateurSettingsInfoQuery, {
        accountId: collaborateurUserAccountId,
      }),
  });

  const account =
    collaborateurSettingsResponse?.organism_getCompteCollaborateurById;

  const remoteOrganism = account?.organisms?.find(
    (organism) => organism.modaliteAccompagnement === "A_DISTANCE",
  );

  const onsiteOrganisms =
    account?.organisms?.filter(
      (organism) => organism.modaliteAccompagnement === "LIEU_ACCUEIL",
    ) || [];

  const maisonMereAAPId = account?.maisonMereAAP?.id;

  return {
    remoteOrganism,
    onsiteOrganisms,
    maisonMereAAPId,
  };
};
