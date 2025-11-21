import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateOrganimsAccountAndOrganismInput } from "@/graphql/generated/graphql";

const getUserAccountQuery = graphql(`
  query getUserAccountForUpdateUserAccountPage(
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

const updateUserAccountMutation = graphql(`
  mutation updateUserAccountForUpdateUserAccountPage(
    $maisonMereAAPId: ID!
    $data: UpdateOrganimsAccountAndOrganismInput!
  ) {
    organism_updateAccountAndOrganism(
      maisonMereAAPId: $maisonMereAAPId
      data: $data
    ) {
      id
    }
  }
`);

export const useUpdateUserAccountPage = ({
  maisonMereAAPId,
  userAccountId,
}: {
  userAccountId: string;
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const updateUserAccount = useMutation({
    mutationFn: (
      data: Omit<UpdateOrganimsAccountAndOrganismInput, "accountId">,
    ) =>
      graphqlClient.request(updateUserAccountMutation, {
        maisonMereAAPId,
        data: { ...data, accountId: userAccountId },
      }),
    mutationKey: [userAccountId, "agencies-settings-update-user-account-page"],
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [userAccountId, "agencies-settings-update-user-account-page"],
      }),
  });

  const { data: userAccountData } = useQuery({
    queryKey: [userAccountId, "agencies-settings-update-user-account-page"],
    queryFn: () =>
      graphqlClient.request(getUserAccountQuery, {
        maisonMereAAPId,
        userAccountId,
      }),
  });

  const userAccount = userAccountData?.organism_getCompteCollaborateurById;

  return {
    userAccount,
    updateUserAccount,
  };
};
