import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CreateCandidacyInput } from "@/graphql/generated/graphql";

const CREATE_VAE_COLLECTIVE_CANDIDACY = graphql(`
  mutation createVaeCollectiveCandidacy(
    $candidateId: UUID!
    $data: CreateCandidacyInput!
  ) {
    candidacy_createCandidacy(candidateId: $candidateId, data: $data) {
      id
    }
  }
`);

export const useCreateVaeCollectiveCandidacy = () => {
  const { graphqlClient } = useGraphQlClient();

  const createCandidacy = useMutation({
    mutationKey: ["createVaeCollectiveCandidacy"],
    mutationFn: ({
      candidateId,
      data,
    }: {
      candidateId: string;
      data: CreateCandidacyInput;
    }) =>
      graphqlClient.request(CREATE_VAE_COLLECTIVE_CANDIDACY, {
        candidateId,
        data,
      }),
  });

  return { createCandidacy };
};
