import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_DROPOUT = graphql(`
  query getCandidacyByIdWithCandidateForDropout($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      certification {
        codeRncp
        label
      }
      feasibility {
        feasibilityFileSentAt
        decisionSentAt
      }
    }
  }
`);

const GET_DROPOUT_REASONS = graphql(`
  query getDropOutReasons {
    getDropOutReasons {
      id
      label
      isActive
    }
  }
`);

const DROPOUT_CANDIDACY_BY_ID = graphql(`
  mutation candidacy_candidateDropOutCandidacy(
    $candidacyId: UUID!
    $dropoutReasonId: UUID!
    $otherReasonContent: String
  ) {
    candidacy_candidateDropOutCandidacy(
      candidacyId: $candidacyId
      dropOut: {
        dropOutReasonId: $dropoutReasonId
        otherReasonContent: $otherReasonContent
      }
    ) {
      id
    }
  }
`);

export const useDropout = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isDropoutLoading } = useQuery({
    queryKey: ["candidacy", "dropout", candidacyId],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_DROPOUT, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;

  const { data: getDropoutReasonsData } = useQuery({
    queryKey: ["getDropoutReasons"],
    queryFn: () => graphqlClient.request(GET_DROPOUT_REASONS),
  });

  const activeDropoutReasons = (
    getDropoutReasonsData?.getDropOutReasons || []
  ).filter((reason) => reason.isActive);

  const { mutateAsync: dropoutCandidacyById } = useMutation({
    mutationFn: ({
      candidacyId,
      dropoutReasonId,
      otherReasonContent,
    }: {
      candidacyId: string;
      dropoutReasonId: string;
      otherReasonContent?: string;
    }) =>
      graphqlClient.request(DROPOUT_CANDIDACY_BY_ID, {
        candidacyId,
        dropoutReasonId,
        otherReasonContent,
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
    activeDropoutReasons,
    isDropoutLoading,
    dropoutCandidacyById,
  };
};
