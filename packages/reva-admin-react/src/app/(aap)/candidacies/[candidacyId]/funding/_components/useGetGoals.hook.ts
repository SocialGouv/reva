import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
const getGoals = graphql(`
  query getGoals {
    getReferential {
      goals {
        id
        label
        order
        needsAdditionalInformation
        isActive
      }
    }
  }
`);

export const useGetGoals = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getRefentialData, isLoading: getGoalsIsLoading } = useQuery({
    queryKey: ["getRefential"],
    queryFn: () => graphqlClient.request(getGoals),
  });

  const goals = getRefentialData?.getReferential?.goals;

  return {
    goals,
    getGoalsIsLoading,
  };
};
