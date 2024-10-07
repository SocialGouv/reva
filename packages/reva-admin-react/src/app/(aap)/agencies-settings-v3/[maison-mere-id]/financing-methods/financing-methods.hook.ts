import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";

const getMaisonMereAAPQuery = graphql(`
  query getAccountMaisonMereFinancingMethods($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      id
      isMcfCompatible
      raisonSociale
    }
  }
`);

const updateMaisonMereAAPFinancingMethodsMutation = graphql(`
  mutation updateMaisonMereAAPFinancingMethods(
    $maisonMereAAPId: ID!
    $isMcfCompatible: Boolean!
  ) {
    organism_updateMaisonMereAAPFinancingMethods(
      maisonMereAAPId: $maisonMereAAPId
      isMcfCompatible: $isMcfCompatible
    ) {
      id
      isMcfCompatible
    }
  }
`);

export const useFinancingMethodsPage = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const { data, isLoading } = useQuery({
    queryKey: [maisonMereAAPId, "maisonMereAAP", "FinancingMethodsPage"],
    queryFn: () =>
      graphqlClient.request(getMaisonMereAAPQuery, { maisonMereAAPId }),
    enabled: !!maisonMereAAPId,
  });

  const updateMaisonMereAAPFinancingMethods = useMutation({
    mutationFn: ({ isMcfCompatible }: { isMcfCompatible: boolean }) =>
      graphqlClient.request(updateMaisonMereAAPFinancingMethodsMutation, {
        maisonMereAAPId,
        isMcfCompatible,
      }),
  });

  const maisonMereAAP = data?.organism_getMaisonMereAAPById;

  return {
    maisonMereAAP,
    isLoading,
    updateMaisonMereAAPFinancingMethods,
  };
};
