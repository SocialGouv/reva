import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getMaisonMerAAPUserAccountsQuery = graphql(`
  query getMaisonMerAAPUserAccounts($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      comptesCollaborateurs {
        id
        firstname
        lastname
        organisms {
          id
        }
      }
    }
  }
`);

const disableCompteCollaborateurMutation = graphql(`
  mutation disableCompteCollaborateurForDisableCompteCollaborateurAAPTile(
    $maisonMereAAPId: ID!
    $accountId: ID!
  ) {
    organism_disableCompteCollaborateur(
      maisonMereAAPId: $maisonMereAAPId
      accountId: $accountId
    )
  }
`);

export const useGestionnaireMaisonMereAAPUserAccount = ({
  maisonMereAAPId,
  userAccountId,
}: {
  maisonMereAAPId: string;
  userAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: maisonMerAAPUserAccounts } = useQuery({
    queryKey: ["maisonMerAAPUserAccounts", maisonMereAAPId],
    queryFn: () =>
      graphqlClient.request(getMaisonMerAAPUserAccountsQuery, {
        maisonMereAAPId,
      }),
  });

  const disableUserAccount = useMutation({
    mutationFn: () =>
      graphqlClient.request(disableCompteCollaborateurMutation, {
        maisonMereAAPId,
        accountId: userAccountId,
      }),
    mutationKey: [userAccountId, "agencies-settings-user-accounts-page"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [userAccountId],
      });
    },
  });

  const userAccounts =
    maisonMerAAPUserAccounts?.organism_getMaisonMereAAPById
      .comptesCollaborateurs;

  const userAccount = userAccounts?.find((a) => a.id === userAccountId);

  return {
    maisonMerAAPUserAccounts,
    userAccount,
    disableUserAccount,
  };
};
