import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyQuery = graphql(`
  query getCandidacyForDropOutDecisionPage {
    candidate_getCandidateWithCandidacy {
      candidacy {
        id
      }
    }
  }
`);

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

  const getCandidacy = useQuery({
    queryKey: ["candidacy"],
    queryFn: () => graphqlClient.request(getCandidacyQuery),
  });

  const updateCandidateCandidacyDropoutDecision = useMutation({
    mutationKey: ["updateCandidateCandidacyDropoutDecisionMutation"],
    mutationFn: ({
      candidacyId,
      dropOutConfirmed,
    }: {
      candidacyId: string;
      dropOutConfirmed: boolean;
    }) =>
      graphqlClient.request(updateCandidateCandidacyDropoutDecisionMutation, {
        candidacyId,
        dropOutConfirmed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "candidate",
          "updateCandidateCandidacyDropoutDecisionMutation",
        ],
      });
    },
  });

  const candidacy =
    getCandidacy.data?.candidate_getCandidateWithCandidacy.candidacy;

  return { candidacy, updateCandidateCandidacyDropoutDecision };
};
