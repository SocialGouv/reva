import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyByIdForFeasibilityDematAutonomeResourcesPage = graphql(`
  query getCandidacyByIdForFeasibilityDematAutonomeResourcesPage(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      feasibilityFileResourceFirstRead
    }
  }
`);

const markFeasibilityFileResourceFirstAsReadMutation = graphql(`
  mutation markFeasibilityFileResourceFirstAsRead($candidacyId: UUID!) {
    candidacy_markFeasibilityFileResourceFirstAsRead(
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

export const useFeasibilityDematAutonomeResourcesPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidateResponse, status: queryStatus } = useSuspenseQuery({
    queryKey: [
      "candidacy",
      "getCandidacyByIdForFeasibilityDematAutonomeResourcesPage",
      candidacyId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCandidacyByIdForFeasibilityDematAutonomeResourcesPage,
        {
          candidacyId,
        },
      ),
  });

  const markFeasibilityFileResourceFirstAsRead = useMutation({
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(markFeasibilityFileResourceFirstAsReadMutation, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "candidacy",
          "getCandidacyByIdForFeasibilityDematAutonomeResourcesPage",
          candidacyId,
        ],
      });
    },
  });

  const candidacy = getCandidateResponse?.getCandidacyById;

  return {
    candidacyId,
    candidacy,
    queryStatus,
    markFeasibilityFileResourceFirstAsRead,
  };
};
