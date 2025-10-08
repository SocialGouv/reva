import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  ExperienceInput,
} from "@/graphql/generated/graphql";

const getCandidateQuery = graphql(`
  query getCandidateForAddExperience {
    candidate_getCandidateWithCandidacy {
      candidacy {
        id
        status
        candidacyDropOut {
          status
        }
      }
    }
  }
`);

const ADD_EXPERIENCE = graphql(`
  mutation add_experience($candidacyId: ID!, $experience: ExperienceInput) {
    candidacy_addExperience(
      candidacyId: $candidacyId
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

export const useAddExperience = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidateData } = useQuery({
    queryKey: ["candidacy", "getCandidateForAddExperience"],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const addExperience = useMutation({
    mutationKey: ["candidacy_addExperience"],
    mutationFn: ({
      candidacyId,
      experience,
    }: {
      candidacyId: string;
      experience: ExperienceInput;
    }) =>
      graphqlClient.request(ADD_EXPERIENCE, {
        candidacyId,
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
    addExperience,
    canEditCandidacy,
    candidacy,
    candidacyAlreadySubmitted,
  };
};
