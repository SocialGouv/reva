import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyQuery = graphql(`
  query getCandidacyForPaymentRequestUniRevaConfirmationPage(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      status
      fundingRequest {
        numAction
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
      isPaymentRequestSent
      isPaymentRequestUnifvaeSent
    }
  }
`);

const confirmPaymentRequestUniRevaMutation = graphql(`
  mutation confirmPaymentRequestUniRevaMutation($candidacyId: UUID!) {
    candidacy_confirmPaymentRequest(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const usePaymentRequestUniRevaConfirmationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const confirmPaymentRequestUniReva = useMutation({
    mutationFn: () =>
      graphqlClient.request(confirmPaymentRequestUniRevaMutation, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  return {
    candidacy,
    getCandidacyStatus,
    confirmPaymentRequestUniReva,
  };
};
