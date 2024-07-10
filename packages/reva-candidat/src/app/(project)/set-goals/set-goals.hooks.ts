import { useQuery, useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";
import { CandidateGoalInput } from "@/graphql/generated/graphql";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

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
  });

  return { getGoals, updateGoals };
};
