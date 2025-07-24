import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CANDIDATE_FORGOT_PASSWORD = graphql(`
  mutation candidate_forgotPassword($email: String!) {
    candidate_forgotPassword(email: $email)
  }
`);

export const useForgotPassword = () => {
  const { graphqlClient } = useGraphQlClient();

  const forgotPassword = useMutation({
    mutationKey: ["candidate_forgotPassword"],
    mutationFn: ({ email }: { email: string }) =>
      graphqlClient.request(CANDIDATE_FORGOT_PASSWORD, { email }),
  });

  return { forgotPassword };
};
