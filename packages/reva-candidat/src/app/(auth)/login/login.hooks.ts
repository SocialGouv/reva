import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const CANDIDATE_ASK_FOR_LOGIN = graphql(`
  mutation candidate_askForLogin($email: String!) {
    candidate_askForLogin(email: $email)
  }
`);

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

export const useLogin = () => {
  const { graphqlClient } = useGraphQlClient();

  const askForLogin = useMutation({
    mutationKey: ["candidate_askForLogin"],
    mutationFn: ({ email }: { email: string }) =>
      graphqlClient.request(CANDIDATE_ASK_FOR_LOGIN, { email }),
  });

  const login = useMutation({
    mutationKey: ["candidate_login"],
    mutationFn: ({ token }: { token: string }) =>
      graphqlClient.request(CANDIDATE_LOGIN, { token }),
  });

  return { askForLogin, login };
};
