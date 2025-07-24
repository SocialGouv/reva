import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CANDIDATE_LOGIN_WITH_TOKEN = graphql(`
  mutation candidate_loginWithToken($token: String!) {
    candidate_loginWithToken(token: $token)
  }
`);

export const useAuth = () => {
  const { graphqlClient } = useGraphQlClient();

  const loginWithToken = useMutation({
    mutationKey: ["candidate_loginWithToken"],
    mutationFn: ({ token }: { token: string }) =>
      graphqlClient.request(CANDIDATE_LOGIN_WITH_TOKEN, { token }),
  });

  return { loginWithToken };
};
