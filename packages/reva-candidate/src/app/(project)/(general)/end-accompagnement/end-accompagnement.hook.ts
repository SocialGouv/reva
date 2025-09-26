import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY_FOR_END_ACCOMPAGNEMENT = graphql(`
  query candidate_getCandidateWithCandidacyForEndAccompagnement {
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
        endAccompagnementStatus
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
  }
`);

const UPDATE_CANDIDACY_END_ACCOMPAGNEMENT_DECISION = graphql(`
  mutation candidacy_updateCandidacyEndAccompagnementDecision(
    $candidacyId: UUID!
    $endAccompagnement: Boolean!
  ) {
    candidacy_updateCandidacyEndAccompagnementDecision(
      candidacyId: $candidacyId
      endAccompagnement: $endAccompagnement
    ) {
      id
    }
  }
`);

export const useEndAccompagnement = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data, isLoading: isEndAccompagnementLoading } = useQuery({
    queryKey: ["candidate", "end-accompagnement"],
    queryFn: () =>
      graphqlClient.request(
        GET_CANDIDATE_WITH_CANDIDACY_FOR_END_ACCOMPAGNEMENT,
      ),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const { mutateAsync: updateCandidacyEndAccompagnementDecision } = useMutation(
    {
      mutationFn: ({
        candidacyId,
        endAccompagnement,
      }: {
        candidacyId: string;
        endAccompagnement: boolean;
      }) =>
        graphqlClient.request(UPDATE_CANDIDACY_END_ACCOMPAGNEMENT_DECISION, {
          candidacyId,
          endAccompagnement,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["candidate"] });
      },
    },
  );

  return {
    candidate,
    isEndAccompagnementLoading,
    updateCandidacyEndAccompagnementDecision,
  };
};
