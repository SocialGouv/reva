import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const GET_CANDIDATE_WITH_CANDIDACY_QUERY = graphql(`
  query getCandidateWithCandidacyForTrainingValidation {
    candidate_getCandidateWithCandidacy {
      id
      candidacy {
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
          isActive
        }
        candidacyDropOut {
          createdAt
        }
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
  const { data: candidateWithCandidacyResponse } = useQuery({
    queryKey: ["candidate", "getCandidateWithCandidacyForTrainingValidation"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY_QUERY),
  });

  const confirmTrainingForm = useMutation({
    mutationKey: ["training_confirmTrainingForm"],
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(CONFIRM_TRAINING_FORM, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const candidacy =
    candidateWithCandidacyResponse?.candidate_getCandidateWithCandidacy
      .candidacy;

  return { candidacy, confirmTrainingForm };
};
