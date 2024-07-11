import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";
import { CandidateInput } from "@/graphql/generated/graphql";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const CANDIDATE_ASK_FOR_REGISTRATION = graphql(`
  mutation candidate_askForRegistration($candidate: CandidateInput!) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

export const useRegistration = () => {
  const { graphqlClient } = useGraphQlClient();

  const askForRegistration = useMutation({
    mutationKey: ["candidate_askForRegistration"],
    mutationFn: (input: CandidateInput) =>
      graphqlClient.request(CANDIDATE_ASK_FOR_REGISTRATION, {
        candidate: input,
      }),
  });

  return { askForRegistration };
};
