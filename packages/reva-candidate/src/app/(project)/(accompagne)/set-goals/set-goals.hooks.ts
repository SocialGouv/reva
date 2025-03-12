import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  CandidateGoalInput,
} from "@/graphql/generated/graphql";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

const getCandidateQuery = graphql(`
  query getCandidateForSetGoals {
    candidate_getCandidateWithCandidacy {
      candidacy {
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

  const { data: getCandidateData } = useQuery({
    queryKey: ["candidate"],
    queryFn: () => graphqlClient.request(getCandidateQuery),
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
        queryKey: ["candidate"],
      });
    },
  });

  const candidacy =
    getCandidateData?.candidate_getCandidateWithCandidacy.candidacy;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidacy?.status as CandidacyStatusStep,
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
