import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CREATE_CONTESTATION = graphql(`
  mutation createContestation(
    $candidacyId: ID!
    $contestationReason: String!
    $readyForJuryEstimatedAt: Timestamp!
  ) {
    candidacy_contestation_caducite_create_contestation(
      candidacyId: $candidacyId
      contestationReason: $contestationReason
      readyForJuryEstimatedAt: $readyForJuryEstimatedAt
    ) {
      id
    }
  }
`);

export const useContestation = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { mutateAsync: createContestation } = useMutation({
    mutationKey: ["createContestation"],
    mutationFn: ({
      candidacyId,
      contestationReason,
      readyForJuryEstimatedAt,
    }: {
      candidacyId: string;
      contestationReason: string;
      readyForJuryEstimatedAt: number;
    }) =>
      graphqlClient.request(CREATE_CONTESTATION, {
        candidacyId,
        contestationReason,
        readyForJuryEstimatedAt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate"],
      });
    },
  });

  return { createContestation };
};
