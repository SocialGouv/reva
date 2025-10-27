import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_FOR_VALIDATE_TRAINING = graphql(`
  query getCandidacyByIdForValidateTraining($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      isCertificationPartial
      financeModule
      additionalHourCount
      basicSkills {
        id
        label
      }
      certificateSkills
      collectiveHourCount
      individualHourCount
      mandatoryTrainings {
        id
        label
      }
      otherTraining
      candidacyOnCandidacyFinancingMethods {
        id
        amount
        additionalInformation
        candidacyFinancingMethod {
          id
          label
        }
      }
      candidacyStatuses {
        id
        status
      }
      candidacyDropOut {
        createdAt
      }
    }
  }
`);

const CONFIRM_TRAINING_FORM = graphql(`
  mutation training_confirmTrainingForm($candidacyId: UUID!) {
    training_confirmTrainingForm(candidacyId: $candidacyId) {
      id
      createdAt
    }
  }
`);

export const useValidateTraining = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: candidateWithCandidacyResponse } = useQuery({
    queryKey: ["candidacy", "getCandidacyByIdForValidateTraining"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_VALIDATE_TRAINING, {
        candidacyId,
      }),
  });

  const confirmTrainingForm = useMutation({
    mutationKey: ["training_confirmTrainingForm"],
    mutationFn: () =>
      graphqlClient.request(CONFIRM_TRAINING_FORM, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidacy"] });
    },
  });

  const candidacy = candidateWithCandidacyResponse?.getCandidacyById;

  return { candidacy, confirmTrainingForm };
};
