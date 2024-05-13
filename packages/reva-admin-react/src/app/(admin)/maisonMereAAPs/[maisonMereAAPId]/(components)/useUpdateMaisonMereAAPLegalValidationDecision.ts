import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateMaisonMereAapLegalValidationDecisionInput } from "@/graphql/generated/graphql";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const updateMaisonMereAAPLegalValidationDecisionMutation = graphql(`
  mutation updateLegalInformationValidationDecision(
    $data: UpdateMaisonMereAAPLegalValidationDecisionInput!
  ) {
    organism_updateLegalInformationValidationDecision(data: $data) {
      id
    }
  }
`);

export const useUpdateMaisonMereAAPLegalValidationDecision = (
  maisonMereAAPId: string,
) => {
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();
  const { mutateAsync: updateMaisonMereAAPLegalValidationDecisionMutate } =
    useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["getMaisonMereAAP", maisonMereAAPId]
        })
      },
      mutationKey: [
        "updateMaisonMereAAPLegalValidationStatus",
        maisonMereAAPId,
      ],
      mutationFn: ({
        data,
      }: {
        data: UpdateMaisonMereAapLegalValidationDecisionInput;
      }) =>
        graphqlClient.request(
          updateMaisonMereAAPLegalValidationDecisionMutation,
          {
            data,
          },
        ),
    });

  return {
    updateMaisonMereAAPLegalValidationDecisionMutate,
  };
};
