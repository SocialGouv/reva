import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_DROP_OUT_DECISION = graphql(`
  query getCandidacyByIdWithCandidateForDropOutDecision($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidacyDropOut {
        createdAt
        dropOutConfirmedByCandidate
        proofReceivedByAdmin
      }
      candidate {
        firstname
        firstname2
        firstname3
        lastname
        givenName
        department {
          label
          code
        }
      }
      certification {
        codeRncp
        label
      }
      feasibility {
        decisionSentAt
      }
      organism {
        modaliteAccompagnement
        label
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

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isDropOutDecisionLoading } = useQuery({
    queryKey: ["candidacy", "drop-out-decision", candidacyId],
    queryFn: () =>
      graphqlClient.request(
        GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_DROP_OUT_DECISION,
        {
          candidacyId,
        },
      ),
  });

  const candidacy = data?.getCandidacyById;

  const updateCandidateCandidacyDropoutDecision = useMutation({
    mutationFn: ({ dropOutConfirmed }: { dropOutConfirmed: boolean }) =>
      graphqlClient.request(updateCandidateCandidacyDropoutDecisionMutation, {
        candidacyId,
        dropOutConfirmed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("candidate") ||
          query.queryKey.includes("candidacy"),
      });
    },
  });

  return {
    candidacy,
    isDropOutDecisionLoading,
    updateCandidateCandidacyDropoutDecision,
  };
};
