import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFileDecisionByCandidacyId = graphql(`
  query dematerializedFeasibilityFileDecisionByCandidacyId($candidacyId: ID!) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      decision
      decisionComment
      decisionSentAt
    }
  }
`);

export const useDecisionCard = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isLoadingDecision } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileWithDecisionByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(
        dematerializedFeasibilityFileDecisionByCandidacyId,
        {
          candidacyId,
        },
      ),
  });
  const decision =
    data?.dematerialized_feasibility_file_getByCandidacyId?.decision;
  const decisionComment =
    data?.dematerialized_feasibility_file_getByCandidacyId?.decisionComment;

  return {
    decision,
    decisionComment,
    isLoadingDecision,
  };
};
