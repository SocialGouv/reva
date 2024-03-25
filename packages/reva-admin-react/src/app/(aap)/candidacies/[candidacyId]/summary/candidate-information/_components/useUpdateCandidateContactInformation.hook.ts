import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidateContactInformationInput } from "@/graphql/generated/graphql";
import { useMutation } from "@tanstack/react-query";

const updateCandidateContactInformationMutation = graphql(`
  mutation updateCandidateContactInformationMutation(
    $candidacyId: String!
    $candidateContactInformation: CandidateContactInformationInput!
  ) {
    candidate_updateCandidateContactInformation(
      candidacyId: $candidacyId
      candidateContactInformation: $candidateContactInformation
    ) {
      id
    }
  }
`);

const useUpdateCandidateContactInformation = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    mutateAsync: updateCandidateContactInformationMutate,
    isPending: updateCandidateContactInformationIsPending,
  } = useMutation({
    mutationKey: ["updateCandidateContactInformation", candidacyId],
    mutationFn: ({
      candidateContactInformation,
    }: {
      candidateContactInformation: CandidateContactInformationInput;
    }) =>
      graphqlClient.request(updateCandidateContactInformationMutation, {
        candidacyId,
        candidateContactInformation,
      }),
  });

  return {
    updateCandidateContactInformationMutate,
    updateCandidateContactInformationIsPending,
  };
};

export default useUpdateCandidateContactInformation;
