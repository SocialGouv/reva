import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";
import { ExperienceInput } from "@/graphql/generated/graphql";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

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
  });

  return { updateExperience };
};
