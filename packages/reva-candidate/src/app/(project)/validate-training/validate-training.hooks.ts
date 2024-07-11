import { useMutation } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const CONFIRM_TRAINING_FORM = graphql(`
  mutation candidacy_confirmTrainingForm($candidacyId: UUID!) {
    candidacy_confirmTrainingForm(candidacyId: $candidacyId) {
      id
      createdAt
    }
  }
`);

export const useValidateTraining = () => {
  const { graphqlClient } = useGraphQlClient();

  const confirmTrainingForm = useMutation({
    mutationKey: ["candidacy_confirmTrainingForm"],
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(CONFIRM_TRAINING_FORM, {
        candidacyId,
      }),
  });

  return { confirmTrainingForm };
};
