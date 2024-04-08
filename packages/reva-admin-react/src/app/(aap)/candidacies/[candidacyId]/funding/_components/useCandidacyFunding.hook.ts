import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  FundingRequestUnifvaeInput,
} from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCandidateFundingRequestReva = graphql(`
  query getCandidateFundingRequestReva($candidacyId: UUID!) {
    candidate_getFundingRequest(candidacyId: $candidacyId) {
      fundingRequest {
        diagnosisHourCount
        diagnosisCost
        postExamHourCount
        postExamCost
        individualHourCount
        individualCost
        collectiveHourCount
        collectiveCost
        basicSkills {
          label
        }
        basicSkillsHourCount
        basicSkillsCost
        mandatoryTrainings {
          label
        }
        mandatoryTrainingsHourCount
        mandatoryTrainingsCost
        certificateSkills
        certificateSkillsHourCount
        certificateSkillsCost
        otherTraining
        otherTrainingHourCount
        otherTrainingCost
        examHourCount
        examCost
      }
    }
  }
`);

const getCandidacyByIdFunding = graphql(`
  query getCandidacyByIdFunding($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      financeModule
      candidacyStatuses {
        status
        isActive
      }
      candidacyDropOut {
        droppedOutAt
      }
      certificateSkills
      otherTraining
      basicSkillIds
      basicSkills {
        id
        label
      }
      mandatoryTrainings {
        id
        label
      }
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
  const candidacyIsXpReva = candidacy?.financeModule === "unireva";
  const candidacyHasAlreadyFundingRequest = !!candidacy?.fundingRequestUnifvae;
  const candidacyHasDroppedOutAndIsIncomplete = !!(
    candidacy?.candidacyDropOut &&
    candidacy.candidacyStatuses.some(
      (status) => status.status === "DOSSIER_FAISABILITE_INCOMPLET",
    )
  );

  const candidacyIsNotRecevable = !!candidacy?.candidacyStatuses.some(
    (status) => status.status === "DOSSIER_FAISABILITE_NON_RECEVABLE",
  );

  const candidacyStatusEligible: CandidacyStatusStep[] = [
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_FAISABILITE_INCOMPLET",
    "DOSSIER_FAISABILITE_NON_RECEVABLE",
  ];
  const isEligibleToViewFundingRequest =
    !candidacyIsLoading &&
    !!candidacy?.candidacyStatuses.some(({ status }) =>
      candidacyStatusEligible.includes(status),
    );

  const { data: candidateFundingRequestRevaData } = useQuery({
    queryKey: [candidacyId, "getCandidateFundingRequestReva"],
    queryFn: () =>
      graphqlClient.request(getCandidateFundingRequestReva, { candidacyId }),
    enabled: candidacyIsXpReva,
  });

  const candidacyFundingRequest = candidacyIsXpReva
    ? candidateFundingRequestRevaData?.candidate_getFundingRequest
        .fundingRequest
    : candidacy?.fundingRequestUnifvae;

  return {
    candidacy,
    candidacyIsLoading,
    createFundingRequestUnifvaeMutate,
    createFundingRequestUnifvaeIsPending,
    candidacyFundingRequest,
    candidacyIsXpReva,
    candidacyHasAlreadyFundingRequest,
    candidacyHasDroppedOutAndIsIncomplete,
    isEligibleToViewFundingRequest,
    candidacyIsNotRecevable,
  };
};
