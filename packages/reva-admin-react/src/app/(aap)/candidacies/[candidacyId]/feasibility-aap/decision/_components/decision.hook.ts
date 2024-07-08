import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdateDecisionInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const createOrUpdateDecision = graphql(`
  mutation createOrUpdateDecision(
    $input: DematerializedFeasibilityFileCreateOrUpdateDecisionInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateDecision(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

const dematerializedFeasibilityFileDecisionByCandidacyId = graphql(`
  query dematerializedFeasibilityFileDecisionByCandidacyId($candidacyId: ID!) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      aapDecision
      aapDecisionComment
      aapDecisionSentAt
    }
  }
`);

export const useDecision = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { mutateAsync: createOrUpdateDecisionMutation } = useMutation({
    mutationFn: (
      input: DematerializedFeasibilityFileCreateOrUpdateDecisionInput,
    ) =>
      graphqlClient.request(createOrUpdateDecision, {
        input,
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          candidacyId,
          "dematerializedFeasibilityFileWithDecisionByCandidacyId",
        ],
      });
    },
  });

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
  const aapDecision =
    data?.dematerialized_feasibility_file_getByCandidacyId?.aapDecision;
  const aapDecisionComment =
    data?.dematerialized_feasibility_file_getByCandidacyId?.aapDecisionComment;

  return {
    createOrUpdateDecisionMutation,
    aapDecision,
    aapDecisionComment,
    isLoadingDecision,
  };
};
