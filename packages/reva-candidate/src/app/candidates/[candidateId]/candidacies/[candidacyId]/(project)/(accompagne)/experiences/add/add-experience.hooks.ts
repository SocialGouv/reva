import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import {
  CandidacyStatusStep,
  ExperienceInput,
} from "@/graphql/generated/graphql";

const getCandidacyByIdForAddExperience = graphql(`
  query getCandidacyByIdForAddExperience($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      candidacyDropOut {
        status
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

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useQuery({
    queryKey: ["candidacy", "getCandidacyByIdForAddExperience", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdForAddExperience, {
        candidacyId,
      }),
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

  const candidacy = data?.getCandidacyById;

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
