import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CANDIDATE_RESET_PASSWORD = graphql(`
  mutation candidate_resetPassword($token: String!, $password: String!) {
    candidate_resetPassword(token: $token, password: $password) {
      accessToken
      refreshToken
      idToken
    }
  }
`);

export const useResetPassword = () => {
  const { graphqlClient } = useGraphQlClient();

  const resetPassword = useMutation({
    mutationKey: ["candidate_resetPassword"],
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      graphqlClient.request(CANDIDATE_RESET_PASSWORD, { token, password }),
  });

  return { resetPassword };
};
