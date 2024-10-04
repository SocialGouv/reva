import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateAgencyInfoInput } from "@/graphql/generated/graphql";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const createAgencyInfoMutation = graphql(`
  mutation createAgencyInfoMutationForAddAgencePage(
    $data: CreateAgencyInfoInput!
  ) {
    organism_createAgencyInfo(data: $data)
  }
`);

export const useAddAgencyPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { mutateAsync: createAgencyInfo } = useMutation({
    mutationFn: (data: CreateAgencyInfoInput) =>
      graphqlClient.request(createAgencyInfoMutation, {
        data,
      }),
    mutationKey: ["organism"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  return { createAgencyInfo, isAdmin };
};
