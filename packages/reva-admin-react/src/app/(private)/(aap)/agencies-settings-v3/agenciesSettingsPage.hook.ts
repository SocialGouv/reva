import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const collaborareurSettingsInfoQuery = graphql(`
  query getCollaborateurSettingsInfoForAgenciesSettingsPage {
    account_getAccountForConnectedUser {
      id
    }
  }
`);

export const useAgenciesSettingsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: collaborateurSettingsResponse } = useQuery({
    queryKey: ["collaborateurSettingsInfo"],
    queryFn: () => graphqlClient.request(collaborareurSettingsInfoQuery),
  });

  const account =
    collaborateurSettingsResponse?.account_getAccountForConnectedUser;

  return {
    account,
  };
};
