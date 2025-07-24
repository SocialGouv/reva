import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getMaisonMereAAPQuery = graphql(`
  query getAccountMaisonMereFinancingMethods($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      isMCFCompatible
      raisonSociale
    }
  }
`);

const updateMaisonMereAAPFinancingMethodsMutation = graphql(`
  mutation updateMaisonMereAAPFinancingMethods(
    $maisonMereAAPId: ID!
    $isMCFCompatible: Boolean!
  ) {
    organism_updateMaisonMereAAPFinancingMethods(
      maisonMereAAPId: $maisonMereAAPId
      isMCFCompatible: $isMCFCompatible
    ) {
      id
      isMCFCompatible
    }
  }
`);

export const useFinancingMethodsPage = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [maisonMereAAPId, "maisonMereAAP", "FinancingMethodsPage"],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPQuery, { maisonMereAAPId }),
    enabled: !!maisonMereAAPId,
  });

  const updateMaisonMereAAPFinancingMethods = useMutation({
    mutationFn: ({ isMCFCompatible }: { isMCFCompatible: boolean }) =>
      graphqlClient.request(updateMaisonMereAAPFinancingMethodsMutation, {
        maisonMereAAPId,
        isMCFCompatible,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [maisonMereAAPId] }),
  });

  const maisonMereAAP = data?.organism_getMaisonMereAAPById;

  return {
    maisonMereAAP,
    isLoading,
    updateMaisonMereAAPFinancingMethods,
  };
};
