import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyQuery = graphql(`
  query getCandidacyForPaymentRequestUnifvaeInvoicePage($candidacyId: ID!) {
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
      fundingRequestUnifvae {
        numAction
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
      paymentRequestUnifvae {
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
      }
    }
  }
`);

const createOrUpdatePaymentRequestUnifvaeMutation = graphql(`
  mutation createOrUpdatePaymentRequestUnifvaeMutation(
    $candidacyId: UUID!
    $paymentRequest: PaymentRequestUnifvaeInput!
  ) {
    candidacy_createOrUpdatePaymentRequestUnifvae(
      candidacyId: $candidacyId
      paymentRequest: $paymentRequest
    ) {
      id
    }
  }
`);
export const usePaymentRequestUniFvaeInvoicePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const createOrUpdatePaymentRequestUnifvae = useMutation({
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
      };
    }) =>
      graphqlClient.request(createOrUpdatePaymentRequestUnifvaeMutation, {
        candidacyId,
        paymentRequest,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;

  return { candidacy, getCandidacyStatus, createOrUpdatePaymentRequestUnifvae };
};
