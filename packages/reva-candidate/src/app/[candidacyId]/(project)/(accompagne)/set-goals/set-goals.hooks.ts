import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  CandidateGoalInput,
} from "@/graphql/generated/graphql";

const getCandidacyByIdForSetGoals = graphql(`
  query getCandidacyByIdForSetGoals($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      candidacyDropOut {
        status
      }
      goals {
        id
      }
    }
  }
`);

const GET_GOALS = graphql(`
  query getGoals {
    getReferential {
      goals {
        id
        label
        order
        needsAdditionalInformation
        isActive
      }
    }
  }
`);

const UPDATE_GOALS = graphql(`
  mutation update_goals($candidacyId: ID!, $goals: [CandidateGoalInput!]!) {
    candidacy_updateGoals(candidacyId: $candidacyId, goals: $goals)
  }
`);

export const useSetGoals = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidateData } = useQuery({
    queryKey: ["candidacy", "getCandidacyByIdForSetGoals"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdForSetGoals, {
        candidacyId,
      }),
  });

  const getGoals = useQuery({
    queryKey: ["getGoals"],
    queryFn: () => graphqlClient.request(GET_GOALS),
  });

  const updateGoals = useMutation({
    mutationKey: ["candidacy_updateGoals"],
    mutationFn: ({
      candidacyId,
      goals,
    }: {
      candidacyId: string;
      goals: CandidateGoalInput[];
    }) =>
      graphqlClient.request(UPDATE_GOALS, {
        candidacyId,
        goals,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidacy"],
      });
    },
  });

  const candidacy = getCandidateData?.getCandidacyById;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidacy?.status as CandidacyStatusStep,
    typeAccompagnement: "ACCOMPAGNE",
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  const candidacyAlreadySubmitted = candidacy?.status !== "PROJET";

  return {
    getGoals,
    updateGoals,
    canEditCandidacy,
    candidacyAlreadySubmitted,
    candidacy,
  };
};
