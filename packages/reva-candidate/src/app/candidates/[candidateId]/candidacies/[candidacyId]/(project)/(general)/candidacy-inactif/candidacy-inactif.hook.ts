import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_CANDIDACY_INACTIF = graphql(`
  query getCandidacyByIdWithCandidateForCandidacyInactif($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      activite
      dateInactifEnAttente
      createdAt
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
        decision
        decisionSentAt
      }
      organism {
        modaliteAccompagnement
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

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isCandidacyInactifLoading } = useQuery({
    queryKey: ["candidacy", "candidacy-inactif"],
    queryFn: () =>
      graphqlClient.request(
        GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_CANDIDACY_INACTIF,
        {
          candidacyId,
        },
      ),
  });

  const candidacy = data?.getCandidacyById;

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
    candidacy,
    isCandidacyInactifLoading,
    updateCandidacyInactifDecision,
  };
};
