import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  ExperienceInput,
} from "@/graphql/generated/graphql";

const getCandidacyByIdForUpdateExperience = graphql(`
  query getCandidacyByIdForUpdateExperience($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      candidacyDropOut {
        status
      }
      experiences {
        id
        title
        startedAt
        duration
        description
      }
    }
  }
`);

const UPDATE_EXPERIENCE = graphql(`
  mutation update_experience(
    $candidacyId: ID!
    $experienceId: ID!
    $experience: ExperienceInput
  ) {
    candidacy_updateExperience(
      candidacyId: $candidacyId
      experienceId: $experienceId
      experience: $experience
    ) {
      id
      title
      startedAt
      duration
      description
    }
  }
`);

export const useUpdateExperience = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useQuery({
    queryKey: ["candidacy", "getCandidacyByIdForUpdateExperience"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdForUpdateExperience, {
        candidacyId,
      }),
  });

  const updateExperience = useMutation({
    mutationKey: ["candidacy_updateExperience"],
    mutationFn: ({
      candidacyId,
      experienceId,
      experience,
    }: {
      candidacyId: string;
      experienceId: string;
      experience: ExperienceInput;
    }) =>
      graphqlClient.request(UPDATE_EXPERIENCE, {
        candidacyId,
        experienceId,
        experience,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidacy"],
      });
    },
  });

  const candidacy = data?.getCandidacyById;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidacy?.status as CandidacyStatusStep,
    typeAccompagnement: "ACCOMPAGNE",
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  const candidacyAlreadySubmitted = candidacy?.status !== "PROJET";

  return {
    updateExperience,
    canEditCandidacy,
    candidacy,
    candidacyAlreadySubmitted,
  };
};
