import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getUserAccountQuery = graphql(`
  query getUserAccountForPositionnementPage(
    $maisonMereAAPId: ID!
    $userAccountId: ID!
  ) {
    organism_getCompteCollaborateurById(
      maisonMereAAPId: $maisonMereAAPId
      accountId: $userAccountId
    ) {
      id
      firstname
      lastname
      email
    }
  }
`);

export const usePositionnementPage = ({
  maisonMereAAPId,
  userAccountId,
}: {
  userAccountId: string;
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: userAccountData } = useQuery({
    queryKey: [userAccountId, "agencies-settings-positionnement-page"],
    queryFn: () =>
      graphqlClient.request(getUserAccountQuery, {
        maisonMereAAPId,
        userAccountId,
      }),
  });

  const userAccount = userAccountData?.organism_getCompteCollaborateurById;

  return {
    userAccount,
  };
};
