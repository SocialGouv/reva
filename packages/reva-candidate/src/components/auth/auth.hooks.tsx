import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const CANDIDATE_LOGIN = graphql(`
  mutation candidate_login($token: String!) {
    candidate_login(token: $token) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
    }
  }
`);

export const useAuth = () => {
  const { graphqlClient } = useGraphQlClient();

  const login = useMutation({
    mutationKey: ["candidate_login"],
    mutationFn: ({ token }: { token: string }) =>
      graphqlClient.request(CANDIDATE_LOGIN, { token }),
  });

  return { login };
};
