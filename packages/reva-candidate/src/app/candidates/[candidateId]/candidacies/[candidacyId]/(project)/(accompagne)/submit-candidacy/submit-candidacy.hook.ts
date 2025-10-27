import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const SUBMIT_CANDIDACY = graphql(`
  mutation submit_candidacy($candidacyId: ID!) {
    candidacy_submitCandidacy(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const useSubmitCandidacy = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const submitCandidacy = useMutation({
    mutationKey: ["candidacy_submitCandidacy"],
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(SUBMIT_CANDIDACY, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidacy"] });
    },
  });

  return { submitCandidacy };
};
