import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";

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
      }
      feasibility {
        decision
      }
      candidacyDropOut {
        createdAt
      }
      certificateSkills
      otherTraining
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
        numAction
      }
    }
  }
`);

export const useCandidacyFunding = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();
  const { data: candidacyData, isLoading: candidacyIsLoading } = useQuery({
    queryKey: [candidacyId, "getCandidacyByIdFunding"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdFunding, { candidacyId }),
  });

  const candidacy = candidacyData?.getCandidacyById;
  const candidacyIsXpReva = candidacy?.financeModule === "unireva";
  const candidacyHasAlreadyFundingRequest = !!candidacy?.fundingRequestUnifvae;
  const candidacyHasBeenDroppedOutAndIncomplete = !!(
    candidacy?.candidacyDropOut &&
    candidacy.candidacyStatuses.some(
      (status) => status.status === "DOSSIER_FAISABILITE_INCOMPLET",
    )
  );
  const candidacyHasBeenNotRecevable = !!candidacy?.candidacyStatuses.some(
    (status) => status.status === "DOSSIER_FAISABILITE_NON_RECEVABLE",
  );
  const candidacyHasBeenRecevable = !!candidacy?.candidacyStatuses.some(
    (status) => status.status === "DOSSIER_FAISABILITE_RECEVABLE",
  );

  const candidacyStatusEligible: CandidacyStatusStep[] = [
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_FAISABILITE_INCOMPLET",
    "DOSSIER_FAISABILITE_NON_RECEVABLE",
  ];
  const isEligibleToViewFundingRequest =
    !candidacyIsLoading &&
    (!!candidacy?.candidacyStatuses.some(({ status }) =>
      candidacyStatusEligible.includes(status),
    ) ||
      candidacyIsXpReva);

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
    candidacyFundingRequest,
    candidacyIsXpReva,
    candidacyHasAlreadyFundingRequest,
    candidacyHasBeenDroppedOutAndIncomplete,
    isEligibleToViewFundingRequest,
    candidacyHasBeenNotRecevable,
    candidacyHasBeenRecevable,
  };
};
