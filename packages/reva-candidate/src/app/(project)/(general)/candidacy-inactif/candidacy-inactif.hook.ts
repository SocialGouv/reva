import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY_FOR_CANDIDACY_INACTIF = graphql(`
  query candidate_getCandidateWithCandidacyForCandidacyInactif {
    candidate_getCandidateWithCandidacy {
      firstname
      firstname2
      firstname3
      lastname
      givenName
      department {
        label
        code
      }
      candidacy {
        id
        activite
        derniereDateActivite
        createdAt
        certification {
          codeRncp
          label
        }
        feasibility {
          decision
          decisionSentAt
        }
        organism {
          modaliteAccompagnement
        }
      }
    }
  }
`);

const UPDATE_CANDIDACY_INACTIF_DECISION = graphql(`
  mutation candidacy_updateCandidacyInactifDecision(
    $candidacyId: UUID!
    $continueCandidacy: Boolean!
  ) {
    candidacy_updateCandidacyInactifDecision(
      candidacyId: $candidacyId
      continueCandidacy: $continueCandidacy
    ) {
      id
    }
  }
`);

export const useCandidacyInactif = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data, isLoading: isCandidacyInactifLoading } = useQuery({
    queryKey: ["candidate", "candidacy-inactif"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY_FOR_CANDIDACY_INACTIF),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const { mutateAsync: updateCandidacyInactifDecision } = useMutation({
    mutationFn: ({
      candidacyId,
      continueCandidacy,
    }: {
      candidacyId: string;
      continueCandidacy: boolean;
    }) =>
      graphqlClient.request(UPDATE_CANDIDACY_INACTIF_DECISION, {
        candidacyId,
        continueCandidacy,
      }),
  });

  return {
    candidate,
    isCandidacyInactifLoading,
    updateCandidacyInactifDecision,
  };
};
