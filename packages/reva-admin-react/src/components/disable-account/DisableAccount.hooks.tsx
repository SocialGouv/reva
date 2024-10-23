import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const account_disableAccount = graphql(`
  mutation account_disableAccount($accountId: ID!) {
    account_disableAccount(accountId: $accountId) {
      id
    }
  }
`);

export const useHooks = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const disableUserAccount = useMutation({
    mutationFn: (accountId: string) =>
      graphqlClient.request(account_disableAccount, {
        accountId,
      }),
    mutationKey: ["accountId"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.findIndex((key) => key == "maisonMereAAP") != -1,
      });
    },
  });

  return { disableUserAccount };
};
