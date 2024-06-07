import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdateDecisionInput } from "@/graphql/generated/graphql";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const createOrUpdateDecision = graphql(`
  mutation createOrUpdateDecision(
    $input: DematerializedFeasibilityFileCreateOrUpdateDecisionInput!
  ) {
    dematerialized_feasibility_file_createOrUpdateDecision(input: $input) {
      id
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
    ) => graphqlClient.request(createOrUpdateDecision, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  return {
    createOrUpdateDecisionMutation,
  };
};
