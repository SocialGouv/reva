import { graphql } from "@/graphql/generated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useRouter } from "next/navigation";

const updateAccounSetupMutation = graphql(`
  mutation updateAccountSetupAfterFirstLogin(
    $data: UpdateMaisonMereAccountSetupInput!
  ) {
    organism_updateMaisonMereAccountSetup(data: $data) {
      showAccountSetup
    }
  }
`);

export const useAccountSetup = () => {
  const { graphqlClient } = useGraphQlClient();

  const updateAccount = useMutation({
    mutationFn: (params: {
      showAccountSetup: boolean;
      maisonMereAAPId: string;
    }) => graphqlClient.request(updateAccounSetupMutation, {
      data: params
    }),
  });

  return { updateAccount };
};
