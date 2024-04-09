import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const account_getImpersonateUrl = graphql(`
  query account_getImpersonateUrl($input: GetImpersonateUrlInput!) {
    account_getImpersonateUrl(input: $input)
  }
`);

export const useHooks = () => {
  const { graphqlClient } = useGraphQlClient();

  const getImpersonateUrl = async (params: {
    candidateId?: string;
    accountId?: string;
  }): Promise<string | undefined | null> => {
    const { candidateId, accountId } = params;

    const response = await graphqlClient.request(account_getImpersonateUrl, {
      input: { candidateId, accountId },
    });

    return response.account_getImpersonateUrl;
  };

  return { getImpersonateUrl };
};
