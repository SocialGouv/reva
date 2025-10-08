import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  ExperienceInput,
} from "@/graphql/generated/graphql";

const getCandidateQuery = graphql(`
  query getCandidateForUpdateExperience {
    candidate_getCandidateWithCandidacy {
      candidacy {
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

  const { data: getCandidateData } = useQuery({
    queryKey: ["candidacy", "getCandidateForUpdateExperience"],
    queryFn: () => graphqlClient.request(getCandidateQuery),
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

  const candidacy =
    getCandidateData?.candidate_getCandidateWithCandidacy.candidacy;

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
