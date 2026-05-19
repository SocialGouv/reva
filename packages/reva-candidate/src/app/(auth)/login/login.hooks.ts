import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CANDIDATE_LOGIN_WITH_CREDENTIALS = graphql(`
  mutation candidate_loginWithCredentials($email: String!, $password: String!) {
    candidate_loginWithCredentials(email: $email, password: $password) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
      requiresOtp
      otpChallengeToken
    }
  }
`);

const CANDIDATE_VERIFY_OTP_CHALLENGE = graphql(`
  mutation candidate_verifyOtpChallenge(
    $challengeToken: String!
    $totp: String!
  ) {
    candidate_verifyOtpChallenge(challengeToken: $challengeToken, totp: $totp) {
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

  const loginWithWithCredentials = useMutation({
    mutationKey: ["candidate_loginWithCredentials"],
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      graphqlClient.request(CANDIDATE_LOGIN_WITH_CREDENTIALS, {
        email,
        password,
      }),
  });

  const verifyOtpChallenge = useMutation({
    mutationKey: ["candidate_verifyOtpChallenge"],
    mutationFn: ({
      challengeToken,
      totp,
    }: {
      challengeToken: string;
      totp: string;
    }) =>
      graphqlClient.request(CANDIDATE_VERIFY_OTP_CHALLENGE, {
        challengeToken,
        totp,
      }),
  });

  return { loginWithWithCredentials, verifyOtpChallenge };
};
