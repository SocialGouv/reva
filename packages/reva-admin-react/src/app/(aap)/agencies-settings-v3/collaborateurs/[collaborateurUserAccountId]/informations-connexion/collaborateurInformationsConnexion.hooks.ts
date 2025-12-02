import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getUserAccountQuery = graphql(`
  query getUserAccountForCollaborateurInformationsConnexionPage(
    $userAccountId: ID!
  ) {
    organism_getCompteCollaborateurById(accountId: $userAccountId) {
      id
      firstname
      lastname
      email
    }
  }
`);

export const useCollaborateurInformationsConnexion = ({
  collaborateurUserAccountId,
}: {
  collaborateurUserAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: userAccountData } = useQuery({
    queryKey: [
      collaborateurUserAccountId,
      "collaborateur-informations-connexion-page",
    ],
    queryFn: () =>
      graphqlClient.request(getUserAccountQuery, {
        userAccountId: collaborateurUserAccountId,
      }),
  });

  const userAccount = userAccountData?.organism_getCompteCollaborateurById;

  return {
    userAccount,
  };
};
