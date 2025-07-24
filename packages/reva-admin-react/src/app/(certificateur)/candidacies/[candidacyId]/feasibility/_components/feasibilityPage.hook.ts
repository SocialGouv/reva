import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getCandidacyWithFeasibilityQuery = graphql(`
  query getCandidacyWithFeasibilityQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      feasibilityFormat
    }
  }
`);

export const useFeasibilityPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getFeasibilityResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyWithFeasibilityQuery"],
    queryFn: () =>
      graphqlClient.request(getCandidacyWithFeasibilityQuery, {
        candidacyId,
      }),
  });

  const candidacy = getFeasibilityResponse?.getCandidacyById;
  const feasibilityFormat = candidacy?.feasibilityFormat;

  return {
    feasibilityFormat,
  };
};
