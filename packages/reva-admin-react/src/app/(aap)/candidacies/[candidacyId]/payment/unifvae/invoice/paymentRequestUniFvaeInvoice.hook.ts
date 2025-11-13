import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { Gender } from "@/graphql/generated/graphql";

const getCandidacyQuery = graphql(`
  query getCandidacyForPaymentRequestUnifvaeInvoicePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        firstname
        lastname
        gender
      }
      feasibility {
        decision
      }
      certification {
        label
      }
      organism {
        label
      }
      fundingRequestUnifvae {
        numAction
        typeForfaitJury
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
      status
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
      candidacyDropOut {
        createdAt
        proofReceivedByAdmin
        dropOutConfirmedByCandidate
      }
      isPaymentRequestSent
      isPaymentRequestUnifvaeSent
      endAccompagnementStatus
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

const getGender = (gender?: Gender | null) => {
  switch (gender) {
    case "man":
      return "Homme";
    case "woman":
      return "Femme";
    default:
      return "Non précisé";
  }
};

export const usePaymentRequestUniFvaeInvoicePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{ candidacyId: string }>();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: [candidacyId, "getCandidacyForPaymentRequestUnifvaeInvoicePage"],
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

  return {
    candidacy,
    getCandidacyStatus,
    createOrUpdatePaymentRequestUnifvae,
    getGender,
  };
};
