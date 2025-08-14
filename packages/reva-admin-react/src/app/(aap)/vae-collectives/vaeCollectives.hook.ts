import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCohortesQuery = graphql(`
  query getCohortesForVaeCollectivesPage {
    cohortesVaeCollectivesForConnectedAap {
      id
      nom
    }
  }
`);

export const useVAECollectivesPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCohortesResponse } = useQuery({
    queryKey: ["getCohortesForVaeCollectivesPage"],
    queryFn: () => graphqlClient.request(getCohortesQuery),
  });

  const cohortes = getCohortesResponse?.cohortesVaeCollectivesForConnectedAap;

  return {
    cohortes,
  };
};
