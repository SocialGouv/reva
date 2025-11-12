import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CreateOrganimsAccountInput } from "@/graphql/generated/graphql";

const createUserAccountMutation = graphql(`
  mutation createOrganismAccountForAddUserAccountPage(
    $maisonMereAAPId: ID!
    $data: CreateOrganimsAccountInput!
  ) {
    organism_createAccount(maisonMereAAPId: $maisonMereAAPId, data: $data) {
      id
    }
  }
`);

export const useAddUserAccountPage = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const createUserAccount = useMutation({
    mutationFn: (data: Omit<CreateOrganimsAccountInput, "maisonMereAAPId">) =>
      graphqlClient.request(createUserAccountMutation, {
        maisonMereAAPId,
        data: { ...data, maisonMereAAPId },
      }),
    mutationKey: ["organisms", "agencies-settings-add-user-account-page"],
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisms"] }),
  });

  return {
    createUserAccount,
  };
};
