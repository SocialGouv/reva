import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyQuery = graphql(`
  query getCandidacyForPaymentRequestUniRevaInvoicePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        firstname
        lastname
        gender
      }
      certification {
        label
      }
      organism {
        label
      }
      mandatoryTrainings {
        id
        label
      }
      basicSkills {
        id
        label
      }
      certificateSkills
      otherTraining
      feasibility {
        decision
      }
      candidacyStatuses {
        isActive
        status
      }
      fundingRequest {
        numAction
        individualHourCount
        individualCost
        collectiveHourCount
        collectiveCost
        mandatoryTrainingsHourCount
        mandatoryTrainingsCost
        basicSkillsHourCount
        basicSkillsCost
        certificateSkillsHourCount
        certificateSkillsCost
        otherTrainingHourCount
        otherTrainingCost
        diagnosisHourCount
        diagnosisCost
        postExamHourCount
        postExamCost
        examHourCount
        examCost
      }
      paymentRequest {
        id
        invoiceNumber
        individualEffectiveHourCount
        individualEffectiveCost
        collectiveEffectiveHourCount
        collectiveEffectiveCost
        mandatoryTrainingsEffectiveHourCount
        mandatoryTrainingsEffectiveCost
        basicSkillsEffectiveHourCount
        basicSkillsEffectiveCost
        certificateSkillsEffectiveHourCount
        certificateSkillsEffectiveCost
        otherTrainingEffectiveHourCount
        otherTrainingEffectiveCost
        diagnosisEffectiveHourCount
        diagnosisEffectiveCost
        postExamEffectiveHourCount
        postExamEffectiveCost
        examEffectiveHourCount
        examEffectiveCost
      }
    }
  }
`);

const createOrUpdatePaymentRequestUniRevaMutation = graphql(`
  mutation createOrUpdatePaymentRequestUniRevaMutation(
    $candidacyId: UUID!
    $paymentRequest: PaymentRequestInput!
  ) {
    candidacy_createOrUpdatePaymentRequest(
      candidacyId: $candidacyId
      paymentRequest: $paymentRequest
    ) {
      id
    }
  }
`);

export const usePaymentRequestUniRevaInvoicePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId, "getCandidacyForPaymentRequestUniRevaInvoicePage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const createOrUpdatePaymentRequestUniReva = useMutation({
    mutationFn: ({
      paymentRequest,
    }: {
      paymentRequest: {
        invoiceNumber: string;
        individualEffectiveHourCount: number;
        individualEffectiveCost: number;
        collectiveEffectiveHourCount: number;
        collectiveEffectiveCost: number;
        mandatoryTrainingsEffectiveHourCount: number;
        mandatoryTrainingsEffectiveCost: number;
        basicSkillsEffectiveHourCount: number;
        basicSkillsEffectiveCost: number;
        certificateSkillsEffectiveHourCount: number;
        certificateSkillsEffectiveCost: number;
        otherTrainingEffectiveHourCount: number;
        otherTrainingEffectiveCost: number;
        diagnosisEffectiveHourCount: number;
        diagnosisEffectiveCost: number;
        postExamEffectiveHourCount: number;
        postExamEffectiveCost: number;
        examEffectiveHourCount: number;
        examEffectiveCost: number;
      };
    }) =>
      graphqlClient.request(createOrUpdatePaymentRequestUniRevaMutation, {
        candidacyId,
        paymentRequest,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  return {
    candidacy,
    getCandidacyStatus,
    createOrUpdatePaymentRequestUniReva,
  };
};
