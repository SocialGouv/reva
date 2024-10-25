import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { TrainingInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

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
