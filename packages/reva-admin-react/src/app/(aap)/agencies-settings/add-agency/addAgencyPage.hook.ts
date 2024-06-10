import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateAgencyInput } from "@/graphql/generated/graphql";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const createAgencyMutation = graphql(`
  mutation createAgencyMutationForAddAgencePage($data: CreateAgencyInput!) {
    organism_createAgency(data: $data)
  }
`);

export const useAgencyPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const createAgency = useMutation({
    mutationFn: (data: CreateAgencyInput) =>
      graphqlClient.request(createAgencyMutation, {
        data,
      }),
    mutationKey: ["organisms"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  return {
    createAgency,
  };
};
