import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { FundingRequestUnifvaeInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCandidacyByIdFunding = graphql(`
  query getCandidacyByIdFunding($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      organism {
        label
      }
      candidate {
        lastname
        firstname
        firstname2
        firstname3
        gender
        email
        phone
      }
      certification {
        label
      }
      fundingRequestUnifvae {
        id
        candidateSecondname
        candidateThirdname
        candidateGender
        individualHourCount
        individualCost
        collectiveHourCount
        collectiveCost
        basicSkillsHourCount
        basicSkillsCost
        mandatoryTrainingsHourCount
        mandatoryTrainingsCost
        certificateSkillsHourCount
        certificateSkillsCost
        otherTrainingHourCount
        otherTrainingCost
        fundingContactFirstname
        fundingContactLastname
        fundingContactEmail
        fundingContactPhone
      }
    }
  }
`);

const createFundingRequestUnifvae = graphql(`
  mutation createFundingRequestUnifvae(
    $candidacyId: UUID!
    $fundingRequest: FundingRequestUnifvaeInput!
  ) {
    candidacy_createFundingRequestUnifvae(
      candidacyId: $candidacyId
      fundingRequest: $fundingRequest
    ) {
      id
    }
  }
`);

export const useCandidacyFunding = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { data: candidacyData, isLoading: candidacyIsLoading } = useQuery({
    queryKey: [candidacyId, "getCandidacyByIdFunding"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdFunding, { candidacyId }),
  });

  const {
    mutateAsync: createFundingRequestUnifvaeMutate,
    isPending: createFundingRequestUnifvaeIsPending,
  } = useMutation({
    mutationFn: (fundingRequest: FundingRequestUnifvaeInput) =>
      graphqlClient.request(createFundingRequestUnifvae, {
        fundingRequest,
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
  });

  const candidacy = candidacyData?.getCandidacyById;

  return {
    candidacy,
    candidacyIsLoading,
    createFundingRequestUnifvaeMutate,
    createFundingRequestUnifvaeIsPending,
  };
};
