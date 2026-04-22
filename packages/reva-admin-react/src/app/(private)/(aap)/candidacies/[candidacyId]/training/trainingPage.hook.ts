import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { TrainingInput } from "@/graphql/generated/graphql";

export const OTHER_FINANCING_METHOD_ID = "a0d5b35b-06bb-46dd-8cf5-fbba5b01c711";

const getCandidacyByIdWithReferential = graphql(`
  query getCandidacyAndReferentialForCandidacyTrainingPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      typology
      conventionCollective {
        id
        idcc
        label
      }
      individualHourCount
      collectiveHourCount
      additionalHourCount
      basicSkills {
        id
      }
      mandatoryTrainings {
        id
      }
      certificateSkills
      otherTraining
      isCertificationPartial
      status
      feasibilityFormat
      financeModule
      candidacyOnCandidacyFinancingMethods {
        additionalInformation
        amount
        candidacyFinancingMethod {
          id
        }
      }
      feasibility {
        decision
      }
    }
    training_getTrainings {
      id
      label
    }
    getBasicSkills {
      id
      label
    }
    getCandidacyFinancingMethods {
      id
      label
      aapDescription
    }
  }
`);

const submitTrainingMutation = graphql(`
  mutation submitTrainingForCandidacyTrainingPage(
    $candidacyId: UUID!
    $training: TrainingInput!
  ) {
    training_submitTrainingForm(
      candidacyId: $candidacyId
      training: $training
    ) {
      id
    }
  }
`);

export const useTrainingPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCandidacyByIdWithReferentiaData,
    status: getCandidacyByIdWithReferentialStatus,
  } = useQuery({
    queryKey: [candidacyId, "getCandidacyForCandidateTrainingPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdWithReferential, {
        candidacyId,
      }),
  });

  const submitTraining = useMutation({
    mutationFn: ({
      candidacyId,
      training,
    }: {
      candidacyId?: string;
      training: TrainingInput;
    }) =>
      graphqlClient.request(submitTrainingMutation, {
        candidacyId,
        training,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  const basicSkillsFromReferential =
    getCandidacyByIdWithReferentiaData?.getBasicSkills || [];
  const trainingsFromReferential =
    getCandidacyByIdWithReferentiaData?.training_getTrainings || [];
  const candidacyFinancingMethodsFromReferential =
    getCandidacyByIdWithReferentiaData?.getCandidacyFinancingMethods || [];
  const candidacy = getCandidacyByIdWithReferentiaData?.getCandidacyById;

  const referential = {
    basicSkillsFromReferential,
    trainingsFromReferential,
    candidacyFinancingMethodsFromReferential,
  };

  return {
    getCandidacyByIdWithReferentialStatus,
    candidacy,
    referential,
    submitTraining,
  };
};
