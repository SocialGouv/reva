import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";
import { ExperienceInput } from "@/graphql/generated/graphql";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

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
  });

  return { addExperience };
};
