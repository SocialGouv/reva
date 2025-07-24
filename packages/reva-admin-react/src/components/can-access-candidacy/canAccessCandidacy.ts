import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const canAccessCandidacyQuery = graphql(`
  query candidacy_canAccessCandidacy($candidacyId: ID!) {
    candidacy_canAccessCandidacy(candidacyId: $candidacyId)
  }
`);

export const useCanAccessCandidacy = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: canAccessCandidacyResponse } = useQuery({
    queryKey: [candidacyId, "canAccessCandidacy"],
    queryFn: () =>
      graphqlClient.request(canAccessCandidacyQuery, {
        candidacyId,
      }),
  });

  const canAccess = canAccessCandidacyResponse?.candidacy_canAccessCandidacy;

  return { canAccess };
};
