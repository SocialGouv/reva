import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFileCandidatValidationCardByCandidacyId =
  graphql(`
    query dematerializedFeasibilityFileCandidatValidationCardByCandidacyId(
      $candidacyId: ID!
    ) {
      dematerialized_feasibility_file_getByCandidacyId(
        candidacyId: $candidacyId
      ) {
        isComplete
      }
    }
  `);

export const useCandidateValidationCard = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isLoadingAttachments } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileCandidatValidationCardByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(
        dematerializedFeasibilityFileCandidatValidationCardByCandidacyId,
        {
          candidacyId,
        },
      ),
  });
  const isDematerializedFeasibilityFileComplete =
    data?.dematerialized_feasibility_file_getByCandidacyId?.isComplete;

  return {
    isDematerializedFeasibilityFileComplete,
    isLoadingAttachments,
  };
};
