import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CANDIDATE_ASK_FOR_REGISTRATION_WITH_PASSWORD = graphql(`
  mutation candidate_askForRegistrationWithPassword($email: String!) {
    candidate_askForRegistrationWithPassword(email: $email)
  }
`);

export const useRegister = () => {
  const { graphqlClient } = useGraphQlClient();

  const askForRegistration = useMutation({
    mutationKey: ["candidate_askForRegistrationWithPassword"],
    mutationFn: ({ email }: { email: string }) =>
      graphqlClient.request(CANDIDATE_ASK_FOR_REGISTRATION_WITH_PASSWORD, {
        email,
      }),
  });

  return { askForRegistration };
};
