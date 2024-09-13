import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { TrainingInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForCandidacyTrainingPage($candidacyId: ID!) {
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

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForCandidateTrainingPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
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

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return { candidacy, submitTraining };
};
