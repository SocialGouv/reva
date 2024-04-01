import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { FundingRequestUnifvaeInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCandidacyByIdFunding = graphql(`
  query getCandidacyByIdFunding($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidacyStatuses {
        id
        status
      }
      organism {
        label
      }
      candidate {
        id
        lastname
        firstname
        firstname2
        firstname3
        gender
        email
        phone
      }
      certification {
        id
        label
        codeRncp
        typeDiplome {
          id
          label
        }
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
    queryKey: [candidacyId, "getCandidacyById"],
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
      successToast("La demande de financement a bien été enregistrée.");
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
