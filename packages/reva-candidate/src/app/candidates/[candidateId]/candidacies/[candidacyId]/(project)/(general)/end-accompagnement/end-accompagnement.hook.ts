import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_END_ACCOMPAGNEMENT = graphql(`
  query getCandidacyByIdWithCandidateForEndAccompagnement($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      endAccompagnementStatus
      endAccompagnementDate
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

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isEndAccompagnementLoading } = useQuery({
    queryKey: ["candidacy", "end-accompagnement", candidacyId],
    queryFn: () =>
      graphqlClient.request(
        GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_END_ACCOMPAGNEMENT,
        {
          candidacyId,
        },
      ),
  });

  const candidacy = data?.getCandidacyById;

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
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.includes("candidate") ||
            query.queryKey.includes("candidacy"),
        });
      },
    },
  );

  return {
    candidacy,
    isEndAccompagnementLoading,
    updateCandidacyEndAccompagnementDecision,
  };
};
