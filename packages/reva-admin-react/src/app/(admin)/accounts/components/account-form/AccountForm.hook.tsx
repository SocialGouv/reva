import { graphql } from "@/graphql/generated";
import { useMutation } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const updateAccountMutation = graphql(`
  mutation updateAccount($accountId: ID!, $accountData: UpdateAccountInput!) {
    account_updateAccount(accountId: $accountId, accountData: $accountData) {
      id
      firstname
      lastname
      email
    }
  }
`);

export const useAccountForm = () => {
  const { graphqlClient } = useGraphQlClient();

  const updateAccount = useMutation({
    mutationFn: (params: {
      accountId: string;
      accountData: { firstname: string; lastname: string; email: string };
    }) => graphqlClient.request(updateAccountMutation, params),
  });

  return { updateAccount };
};
