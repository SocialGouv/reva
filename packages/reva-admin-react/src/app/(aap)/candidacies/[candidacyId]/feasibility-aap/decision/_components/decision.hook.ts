import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput } from "@/graphql/generated/graphql";

const createOrUpdateDecision = graphql(`
  mutation createOrUpdateDecision(
    $input: DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateAapDecision(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

const feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId =
  graphql(`
    query feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId(
      $candidacyId: ID!
    ) {
      feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
        dematerializedFeasibilityFile {
          aapDecision
          aapDecisionComment
        }
      }
    }
  `);

export const useDecision = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { mutateAsync: createOrUpdateDecisionMutation } = useMutation({
    mutationFn: (
      input: DematerializedFeasibilityFileCreateOrUpdateAapDecisionInput,
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
        feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId,
        {
          candidacyId,
        },
      ),
  });
  const aapDecision =
    data?.feasibility_getActiveFeasibilityByCandidacyId
      ?.dematerializedFeasibilityFile?.aapDecision;
  const aapDecisionComment =
    data?.feasibility_getActiveFeasibilityByCandidacyId
      ?.dematerializedFeasibilityFile?.aapDecisionComment;

  return {
    createOrUpdateDecisionMutation,
    aapDecision,
    aapDecisionComment,
    isLoadingDecision,
  };
};
