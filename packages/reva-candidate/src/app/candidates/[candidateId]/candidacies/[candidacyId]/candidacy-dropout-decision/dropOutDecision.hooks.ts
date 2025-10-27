import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const updateCandidateCandidacyDropoutDecisionMutation = graphql(`
  mutation updateCandidateCandidacyDropoutDecision(
    $candidacyId: UUID!
    $dropOutConfirmed: Boolean!
  ) {
    candidacy_updateCandidateCandidacyDropoutDecision(
      candidacyId: $candidacyId
      dropOutConfirmed: $dropOutConfirmed
    ) {
      id
    }
  }
`);

export const useDropOutDecisionPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const updateCandidateCandidacyDropoutDecision = useMutation({
    mutationKey: ["updateCandidateCandidacyDropoutDecisionMutation"],
    mutationFn: ({ dropOutConfirmed }: { dropOutConfirmed: boolean }) =>
      graphqlClient.request(updateCandidateCandidacyDropoutDecisionMutation, {
        candidacyId,
        dropOutConfirmed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "candidacy",
          "updateCandidateCandidacyDropoutDecisionMutation",
        ],
      });
    },
  });

  return { updateCandidateCandidacyDropoutDecision };
};
