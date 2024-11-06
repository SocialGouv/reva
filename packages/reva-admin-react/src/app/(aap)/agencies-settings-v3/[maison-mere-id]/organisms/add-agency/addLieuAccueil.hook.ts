import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateLieuAccueilInfoInput } from "@/graphql/generated/graphql";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const createLieuAccueilInfoMutation = graphql(`
  mutation createLieuAccueilInfoMutationForAddAgencePage(
    $data: CreateLieuAccueilInfoInput!
  ) {
    organism_createLieuAccueilInfo(data: $data)
  }
`);

export const useAddLieuAccueilPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { mutateAsync: createLieuAccueilInfo } = useMutation({
    mutationFn: (data: CreateLieuAccueilInfoInput) =>
      graphqlClient.request(createLieuAccueilInfoMutation, {
        data,
      }),
    mutationKey: ["organism"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  return { createLieuAccueilInfo, isAdmin };
};
