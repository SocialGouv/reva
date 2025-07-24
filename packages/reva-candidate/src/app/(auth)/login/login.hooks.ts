import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CANDIDATE_ASK_FOR_LOGIN = graphql(`
  mutation candidate_askForLogin($email: String!) {
    candidate_askForLogin(email: $email)
  }
`);

const CANDIDATE_LOGIN_WITH_CREDENTIALS = graphql(`
  mutation candidate_loginWithCredentials($email: String!, $password: String!) {
    candidate_loginWithCredentials(email: $email, password: $password) {
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

  const loginWithWithCredentials = useMutation({
    mutationKey: ["candidate_loginWithCredentials"],
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      graphqlClient.request(CANDIDATE_LOGIN_WITH_CREDENTIALS, {
        email,
        password,
      }),
  });

  return { askForLogin, loginWithWithCredentials };
};
