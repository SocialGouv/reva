import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidateUpdateInput } from "@/graphql/generated/graphql";
import { useMutation } from "@tanstack/react-query";

const updateCandidateInformationMutation = graphql(`
  mutation updateCandidateInformationMutation(
    $candidacyId: String!
    $candidate: CandidateUpdateInput!
  ) {
    candidate_updateCandidate(
      candidacyId: $candidacyId
      candidate: $candidate
    ) {
      id
    }
  }
`);

const useUpdateCandidateInformation = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    mutateAsync: updateCandidateInformationMutate,
    isPending: updateCandidateInformationIsPending,
  } = useMutation({
    mutationKey: ["updateCandidateInformation", candidacyId],
    mutationFn: ({ candidate }: { candidate: CandidateUpdateInput }) =>
      graphqlClient.request(updateCandidateInformationMutation, {
        candidacyId,
        candidate,
      }),
  });

  return {
    updateCandidateInformationMutate,
    updateCandidateInformationIsPending,
  };
};

export default useUpdateCandidateInformation;
