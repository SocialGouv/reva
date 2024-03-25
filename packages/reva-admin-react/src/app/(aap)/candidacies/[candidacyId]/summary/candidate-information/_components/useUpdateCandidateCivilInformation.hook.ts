import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidateCivilInformationInput } from "@/graphql/generated/graphql";
import { useMutation } from "@tanstack/react-query";

const updateCandidateCivilInformationMutation = graphql(`
  mutation updateCandidateCivilInformationMutation(
    $candidacyId: String!
    $candidateCivilInformation: CandidateCivilInformationInput!
  ) {
    candidate_updateCandidateCivilInformation(
      candidacyId: $candidacyId
      candidateCivilInformation: $candidateCivilInformation
    ) {
      id
    }
  }
`);

const useUpdateCandidateCivilInformation = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    mutateAsync: updateCandidateCivilInformationMutate,
    isPending: updateCandidateCivilInformationIsPending,
  } = useMutation({
    mutationKey: ["updateCandidateCivilInformation", candidacyId],
    mutationFn: ({
      candidateCivilInformation,
    }: {
      candidateCivilInformation: CandidateCivilInformationInput;
    }) =>
      graphqlClient.request(updateCandidateCivilInformationMutation, {
        candidacyId,
        candidateCivilInformation,
      }),
  });

  return {
    updateCandidateCivilInformationMutate,
    updateCandidateCivilInformationIsPending,
  };
};

export default useUpdateCandidateCivilInformation;
