import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const UPDATE_LAST_ACTIVITY_DATE = graphql(`
  mutation updateLastActivityDate(
    $candidacyId: UUID!
    $readyForJuryEstimatedAt: Timestamp!
  ) {
    candidacy_updateLastActivityDate(
      candidacyId: $candidacyId
      readyForJuryEstimatedAt: $readyForJuryEstimatedAt
    ) {
      id
    }
  }
`);

export const useActualisation = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { mutateAsync: updateLastActivityDate } = useMutation({
    mutationKey: ["updateLastActivityDate"],
    mutationFn: ({
      candidacyId,
      readyForJuryEstimatedAt,
    }: {
      candidacyId: string;
      readyForJuryEstimatedAt: number;
    }) =>
      graphqlClient.request(UPDATE_LAST_ACTIVITY_DATE, {
        candidacyId,
        readyForJuryEstimatedAt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate"],
      });
    },
  });

  return { updateLastActivityDate };
};
