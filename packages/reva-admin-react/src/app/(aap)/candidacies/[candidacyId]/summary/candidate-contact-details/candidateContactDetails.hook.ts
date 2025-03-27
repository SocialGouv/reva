import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCandidateContactDetailsQuery = graphql(`
  query getCandidateContactDetails($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        id
        phone
        email
      }
    }
  }
`);

const updateCandidateContactDetailsMutation = graphql(`
  mutation updateCandidateContactDetailsForCandidateContactDetailsPage(
    $candidacyId: String!
    $candidateId: String!
    $candidateContactDetails: CandidateUpdateContactDetailsInput!
  ) {
    candidate_updateCandidateContactDetails(
      candidacyId: $candidacyId
      candidateId: $candidateId
      candidateContactDetails: $candidateContactDetails
    ) {
      id
      phone
      email
    }
  }
`);

export const useCandidateContactDetailsPageLogic = ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidateContactDetailsResponse } = useQuery({
    queryKey: ["getCandidateContactDetails", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidateContactDetailsQuery, {
        candidacyId,
      }),
  });

  const updateCandidateContactDetails = useMutation({
    mutationKey: [
      "updateCandidateContactDetailsForCandidateContactDetailsPage",
      candidacyId,
    ],
    mutationFn: ({
      candidacyId,
      candidateId,
      candidateContactDetails,
    }: {
      candidacyId: string;
      candidateId: string;
      candidateContactDetails: { phone: string; email?: string };
    }) =>
      graphqlClient.request(updateCandidateContactDetailsMutation, {
        candidacyId,
        candidateId,
        candidateContactDetails,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
  });

  const candidate =
    getCandidateContactDetailsResponse?.getCandidacyById?.candidate;

  return {
    candidate,
    updateCandidateContactDetails,
  };
};
